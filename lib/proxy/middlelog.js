import { decodeAppToken } from '../utils/tokenutils.js'
import libSSE from '../start/sse.js'

const setupMiddlelog = (app, logger) => {
    app.all('*',async function (req, res, next) {
        try {
            const STREAMLOG = process.env.SSEENDPOINT ? process.env.SSEENDPOINT : '/streamlog'
            let sse = libSSE.getSSE()
            if (!sse)
                sse = libSSE.setupSSE(app, STREAMLOG);
            let token, decoded
            if (req.headers["authorization"]) {
                // GET USER
                token = req.headers["authorization"].split(' ')[1]
                decoded = await decodeAppToken(token)
                const user = { sub: decoded.sub, auth: decoded.auth, permissions: decoded.permissions, uuid: decoded.uuid, name: decoded.name, surname: decoded.surname };
                // GET REQUEST
                const request = { method: req.method, url: req.url, host: req.headers.host, body: req.body }
                const info = { user: user, method: request }
                // LOG INFO
                //console.log(info)
                logger.info(JSON.stringify(info))
                if (process.env.SSE == 'ON')
                    sse.send(JSON.stringify(info), "message")
            }
            next()
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: error });
        }
    })
}

export default setupMiddlelog