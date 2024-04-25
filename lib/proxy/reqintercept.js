import { decodeAppToken } from '../utils/tokenutils.js'
import { delSessionFromToken } from '../utils/tokenutils.js'


const reqIntercept = (req, res,r,app) => {
    return new Promise(async (resolve, reject) => {
        let token,decoded
        if (req.headers["authorization"]) {
            token = req.headers["authorization"].split(' ')[1]
            decoded = await decodeAppToken(token)
        }
        switch (r.url) {
            case '/signup':
                // Intercepts signup call and force role to USER
                if (req.body.userobject)
                    req.body.userobject.role = 'USER'
                break
            case '/logout':
                // Intercepts logout call and delete session
                if (req.headers["authorization"]) {
                    const token = req.headers["authorization"].split(' ')[1]
                    const ret = await delSessionFromToken(app.locals.store, token)
                    res.statusCode = 200
                    res.send(ret);
                    resolve('ok')
                }
                break;
            default:
                // Intercepts  call and check if role is included in authroles
                if (r.authroles && r.authroles.length > 0 && decoded && !r.authroles.includes(decoded.auth)) {
                    reject('Unauthorized')
                }
                break
        }
        resolve('ok')
    })
}

const setupReqIntercept = (app, routes) => {
    routes.forEach(r => {
        if (r.reqIntercept) {
            app.use(r.url, function (req, res, next) {
                reqIntercept(req, res,r,app).then(() => {
                    next();
                }).catch((err) => {
                    const error = {}
                    error.status = 401
                    error.message = err
                    res.status(401).send({ error });
                })
            });
        }
    })
}

export default setupReqIntercept