import { createProxyMiddleware } from 'http-proxy-middleware'
import http from 'node:http';

const agent = new http.Agent()


const setupProxies = (app, routes) => {
    routes.forEach(r => {
        if (r.agent == 'http') {
            r.proxy.agent = agent
        }
        app.use(r.url, createProxyMiddleware(r.proxy));
    })
}

export default setupProxies