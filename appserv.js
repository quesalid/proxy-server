/********************************************************
 * APP PROXY SERVER 
 * Proxies user request
 * 
 * OAUTH2 REQUEST FLOW
 * |----------|-----------------|-------------|-------------|
 * | BROWSER  |   APP PROXY     | API SERVER  |  ID SERVER  |
 * |------------------------------------------|-------------|
 * | (req) -->|-->              |             |             | browser requests resource
 * |          |   (tokverify)   |             |             | app-proxy check apptoken
 * |          |     |ok    |nok |             |             | if bad apptoken app-proxy redirects browser to id-server
 * | (redir)<-|-----|------     |             |             | 
 * |     |    |     |           |             |             |
 * |     ---->|-----|-----------|------------>|  (chekred)  | id-server checks redir with registered redirection
 * |          |     |           |             |   |nok  |ok | ERROR if not match - redir is an endpoint inside app-proxy
 * |          |     |           |             |   |     |   | else redirect browser to login page
 * |    [1]<--|-----|-----------|-------------| (ERR)   |   |
 * |      ----|-----|-----------|-------------|<-----(login)|
 * |      |   |     |           |             |             |
 * | (login)->|-----|-----------|------------>|  (check)    | request authtoken with apikey & credentials
 * |          |     |           |             |   |nok |ok  |
 * |    [2]<--|-----|-----------|-------------| (ERR)  |    | ERROR if bad credentials or bad apikey
 * |          |     |           |             |        |    | else
 * |    <-----|-----|-(apptoken)|-------------|<-(token)    | id-server send key + authtoken to redirect endpoint in app-proxy 
 * |    |     !     |           |             |             | app-proxy transforms authtoken to apptoken and send to browser
 * |    |     |     |           |             |             | browser access resource with apptoken
 * | (req) -->|-->  |           |             |             |
 * |          |   (route) ----->|-->          |             | app-proxy routes browser to the resource (api-server)
 * |          |            <----|<-(res)      |             | api-server reponds to browser via app-proxy
 * |    [3]<--|<-- (format)     |             |             | app-proxy eventually reformats the response
 * |__________|_________________|_____________|_____________| SUCCESS
 * 
 * PROXY AUTH REQUEST FLOW
 * |----------|-----------------|-------------|-------------|
 * | BROWSER  |   APP PROXY     | API SERVER  |  ID SERVER  |
 * |------------------------------------------|-------------|
 * | (req) -->|-->              |             |             | browser requests resource
 * |          |   (tokverify)   |             |             | app-proxy check apptoken in coockie
 * |          |     |nok    |ok |             |             | if bad apptoken app-proxy return 401 Unauthorized,
 * | (401)<---|-----|       |   |             |             | 
 * | (login)->|-----(red logon)-|------------>|  (check)    | login: app proxy redirects to id server
 * |          |     |           |             |   |nok |ok  |
 * |    [2]<--|-----|-----------|-------------| (ERR)  |    | ERROR if bad credentials
 * |          |     |           |             |        |    | else
 * |    <-----|-----|-(apptoken)|-------------|<-(token)    | id-server send key + authtoken to redirect endpoint in app-proxy
 * |    |     !     |           |             |             | app-proxy transforms authtoken to apptoken and send to browser
 * |    |     |     |           |             |             | browser access resource with apptoken
 * | (req) -->|-->  |           |             |             |
 * |          |   (route) ----->|-->          |             | app-proxy routes browser to the resource (api-server)
 * |          |            <----|<-(res)      |             | api-server reponds to browser via app-proxy
 * |    [3]<--|<-- (format)     |             |             | app-proxy eventually reformats the response
 * |__________|_________________|_____________|_____________| SUCCESS 
 * 
 * 
 * */
// API GATEWAY
// https://medium.com/geekculture/create-an-api-gateway-using-nodejs-and-express-933d1ca23322
// DEBUG LOGS - (SSE must be enabled in config file)
// curl --insecure  https://api.livingnet.eu:3002/streamlog
// SERVER CLUSTER
// https://www.digitalocean.com/community/tutorials/how-to-scale-node-js-applications-with-clustering
// SERVER IMPORTS
import minimist from 'minimist'
import express from "express";
import https from 'https';
import cors from 'cors'
import http from 'http';
import path from "path"
import helmet from 'helmet'
import { fileURLToPath } from 'url';
// CRYPTO UTILS
import cutils from './lib/utils/cryptoutils.js'
// FROM LOCAL LIB
import startup from "./lib/start/startup.js";
import errorHandler from './lib/start/errorhandler.js'
import loggers from './lib/start/logger.js'
import httpLogger from './lib/start/httpLogger.js'
import setupStatic from './lib/start/static.js'
import libSSE from './lib/start/sse.js'
// PROXY ROUTES
import setupProxies from './lib/proxy/proxy.js'
import setupRateLimit from './lib/proxy/ratelimit.js'
import setupCreditCheck from './lib/proxy/checkcredit.js'
import setupBodyParser from './lib/proxy/bpars.js'
import setupAddQuery from './lib/proxy/addquery.js'
import setupMiddlelog from './lib/proxy/middlelog.js'
import setupReqIntercept from './lib/proxy/reqintercept.js'
// AUTH
import setupAuth from './lib/auth/auth.js'



const logger = loggers.simple

const appServ = async () => {
    let argv = minimist(process.argv.slice(2));
    logger.info(JSON.stringify(argv))
    if (argv.c)
        process.env.GP_CONFFILE = argv.c
    startup()
        .then((ROUTES) => {
            let port
            let version = process.env.VERSION
          

            // GET PORT ARRAY
            if (process.env.HTTPPORT)
                port = process.env.HTTPPORT
           

            const app = express();

            
            // HELMET - Helmet helps secure Express apps by setting HTTP response headers.
            if (process.env.HELMET == 'true') {
                logger.info("USE HELMET")
                // Set/Unset Content Security Policy
                process.env.CSP == 'true' ? app.use(helmet()) : app.use(helmet({ contentSecurityPolicy: false }))
            }
            // CORS - enable CORS with various options.
            if (process.env.CORSENABLE == 'true') {
                logger.info("USE CORS")
                app.use(cors({ origin: true }))
            }
            // BODYPARSER - Parse incoming request bodies in a middleware before the handlers
            if (process.env.BODYPARSER == 'true') {
                logger.info("USE BODYPARSER")
                setupBodyParser(app, ROUTES)
            }
            // MORGAN LOGGER - HTTP request logger middleware for node.js
            app.use(httpLogger)
            // AUTH - force authorization checks on per-route basis
            if (process.env.AUTH) {
                logger.info("USE AUTH " + process.env.AUTH)
                setupAuth(app, ROUTES, port)
            }
            // RATE LIMIT - force rate limiter on per-route basis
            if (process.env.RATELIMIT == 'true') {
                logger.info("USE RATELIMIT")
                setupRateLimit(app, ROUTES);
            }
            // CHECK CREDIT - TBD
            if (process.env.CREDITCHECK == 'true') {
                logger.info("USE CREDIT CHECK")
                setupCreditCheck(app, ROUTES);
            }
            // SERVE STATIC FILES - eventually serves static files from proxy
            if (process.env.STATIC) {
                logger.info("USE STATIC - "+ process.env.STATIC)
                setupStatic(app, process.env.STATIC);
            }
            // MIDDLELOG - enables Server Side Events logging
            if (process.env.SSE == 'ON') {
                setupMiddlelog(app, loggers.splat)
            }
            // ADD QUERY PARAMTERS - add query parameter to url string on per-route basis
            setupAddQuery(app, ROUTES);
            // ADD REQUEST INTERCEPT - intercept routes request and make specific modifications
            setupReqIntercept(app,ROUTES)
            // PROXY ROUTES - aet up proxy middleware on per-route basis
            setupProxies(app, ROUTES);
            // ENABLE SSE AND POST ENDPOINT
            if (process.env.SSEWEB == 'ON') {
                logger.info("USE SSE")
                const STREAMLOG = process.env.SSEENDPOINT ? process.env.SSEENDPOINT : '/streamlog'
                let sse = libSSE.getSSE()
                if (!sse) {
                    sse = libSSE.setupSSE(app, STREAMLOG);
                }
                const LOGPOST = process.env.LOGPOST ? process.env.LOGPOST:'/loggerpost'
                app.post(LOGPOST, (req, res, next) => {
                    let body = ''
                    try {
                        req.on('data', chunk => {
                            body += chunk.toString(); // convert Buffer to string
                        });
                        req.on('end', () => {
                            body = JSON.parse(body)
                            console.log("SSE ",body.message)
                            sse.send(JSON.stringify(body.message), "message")
                            res.status(200).send("OK")
                        });
                    } catch (error) {
                        next(error)
                    }
                });
            }
            // ERROR HANDLER
            app.use(errorHandler)
            let server
            switch (process.env.HTTPTYPE) {
                case "HTTP":
                    server = http.createServer(app);
                    break;
                case "HTTPS":
                    try {
                        let __dirname = path.dirname(fileURLToPath(import.meta.url));
                        // if development use self signed certs else use letsencrypt certs
                        let certfile = process.env.APICERTFILE ? process.env.APICERTFILE: path.join(__dirname, 'conf', 'cert.pem')
                        let keyfile = process.env.APIKEYFILE ? process.env.APIKEYFILE: path.join(__dirname, 'conf', 'key.pem')
                        const { key, cert } = cutils.getCerts(keyfile, certfile)
                        server = https.createServer({ key: key, cert: cert }, app);
                    } catch (error) {
                        logger.error(error)
                        process.exit(0)
                    }
                    break
            }
            server.listen(port, () => {
                logger.info("*******************************************")
                logger.info("     PROXY SERVER  v." + version + "\n")
                logger.info("BINDING ON HOST: " + process.env.SERVERHOST)
                logger.info(process.env.HTTPTYPE + ' SERVER: listening on port ' + process.env.HTTPPORT);
                logger.info(`worker pid=${process.pid}\n`);
                logger.info("*******************************************")
            })
           
    }).catch((error) => {
        logger.error(error, 'daemon', false);
    });

}

//export default appServ
appServ()