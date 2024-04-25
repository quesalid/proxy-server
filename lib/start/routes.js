import path from 'path'
import fs from 'fs'
import pkg from 'http-proxy-middleware';
const { responseInterceptor, fixRequestBody } = pkg;
import { getAppToken } from "../utils/tokenutils.js"
import https from 'https';
//import libSSE from '../start/sse.js'

const agent = new https.Agent({
    rejectUnauthorized: false
})


/*
 * ROUTER CONFIG
 * url: proxy url
 * auth: true/false, if true, auth middleware is used
 * creditCheck: true/false, if true, check middleware is used
 * loginproxy: true/false, if true, onProxyResLogin is used
 * bodyparser: <type>, if not null, bodyparser type middleware is used
 * addQuery: <querystring>, add <querystring> to request
 * reqIntercept: use request Interceptor
 * authroles: <role>, if not null, check if user has <role> in roles (in Interceptor)
 * rateLimit: {windowsMs: <observetion period in ms>,max:<max request in windowsMs>}, if not null, use rate limit middleware
 * proxy: PROXY CONFIG OPTIONS
 * 
 * PROXY CONFIG OPTIONS
 * target: proxy target
 * pathRewrite: [oldapi:newapi]
 * router: {requrl: re-target url}  - re-target target for specific requests
 * loglevel: string, ['debug', 'info', 'warn', 'error', 'silent']. Default: 'info'
 * logProvider: function, modify or replace log provider. Default: console.
 * agent: object to be passed to http(s).request
 * ssl: object to be passed to https.createServer()
 * ws: true/false: if you want to proxy websockets
 * xfwd: true/false, adds x-forward headers
 * secure: true/false, if you want to verify the SSL Certs
 * toProxy: true/false, passes the absolute URL as the path (useful for proxying to proxies)
 * prependPath: true/false, Default: true - specify whether you want to prepend the target's path to the proxy path
 * headers: object, adds request headers. 
 * 
 * */

const onProxyResLogin = responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
    try {
            const buffer = responseBuffer.toString('utf8')
            let response = JSON.parse(responseBuffer.toString('utf8'));
            
            if (response.status >= 300) {
                console.log("** ROUTES ** ERROR", response)
                return JSON.stringify(response)
            }
            const key = response.response.key
            const authtoken = response.response.token
            if (key && authtoken) {
       
            // DECODE RECEVED AUTH TOKEN AND BUILD NEW APP TOKEN
            const [apptoken, publiKey] = await getAppToken(authtoken, key)
            let expires = 10000
            if (process.env.AUTH_APP_EXPIRES)
                expires = parseInt(process.env.AUTH_APP_EXPIRES) * 1000
            proxyRes.headers['Set-Cookie'] = ["token=" + apptoken + '; expires=' + expires,
                "key=" + publiKey + '; expires=' + expires]
            proxyRes.headers['Authorization'] = 'bearer ' + apptoken
            response.response.key = publiKey
            response.response.token = apptoken
            req.session.app_token = apptoken
            req.session.pub_key = publiKey
            return JSON.stringify(response)
        } 
        } catch (error) {
            const err = {
                    status: 500,
                    message: JSON.stringify(error),
                    type: 'JSON'
                }
            return JSON.stringify(err)
        }
})

const log = async (proxyReq, req, res) => {
    // log original request and proxied request info
    const exchange = `[DEBUG] ${req.method} ${req.path} -> ${proxyReq.protocol}//${proxyReq.host}${proxyReq.path}`;

    fixRequestBody(proxyReq, req, res)
}

const ROUTES = function (routepath) {
    let routefile = ''
    try {
        const STREAMLOG = process.env.SSEENDPOINT ? process.env.SSEENDPOINT : '/streamlog'
        if (process.env.GP_ROUTEFILE) {
            routefile = path.join(process.cwd(), process.env.GP_ROUTEFILE).toString()
        } else {
            if (routepath)
                routefile = path.join(routepath, 'routes-config.json').toString()
            else
                throw ("configpath required")
        }
        const data = fs.readFileSync(routefile)
        const routes = JSON.parse(data)
        const froutes = []
        for (let i = 0; i < routes.length; i++) {
            // ADD APIKEY TO ROUTE HEADER
            routes[i].proxy.headers = { 'x-api-key': process.env.AUTH_CLIENTSECRET }
            routes[i].proxy.agent = agent
            if (routes[i].loginproxy) {
                routes[i].proxy.onProxyRes = onProxyResLogin
                routes[i].proxy.onProxyReq = fixRequestBody
            } else {
                if (process.env.DEBUG_RESPONSE)
                    routes[i].proxy.onProxyReq = log
                else
                    routes[i].proxy.onProxyReq = fixRequestBody
            }
            if(!routes[i].disabled)
                froutes.push(routes[i])
        }
        return froutes
    } catch (error) {
        throw error
    }
}



export default ROUTES