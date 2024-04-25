import morgan from 'morgan'
import loggers from './logger.js'
import jwt from 'jsonwebtoken';

const logger = loggers.simple

logger.stream = {
    write: message => logger.info(message.substring(0, message.lastIndexOf('\n')))
};

morgan.token('remote-ip', (req,res) => {
    return req.socket.remoteAddress

})

morgan.token('remote-port', (req,res) => {
    return req.socket.remotePort

})

morgan.token('message', (req, res) => {
    return res.statusMessage

})

morgan.token('protocol', (req, res) => {
    return req.protocol

})

morgan.token('host', (req, res) => {
    return req.hostname

})

morgan.token('body', (req, res) => {
    if (req.body) {
        const clone = JSON.parse(JSON.stringify(req.body))
        // clear sensitive informations
        if (clone.password)
            clone.password = '*********'
        if (clone.passwd)
            clone.passwd = '*********'
        return JSON.stringify(clone)
    }
    return("-")
})

morgan.token('reqheader', (req, res) => {
    const clone = JSON.parse(JSON.stringify(req.headers))
    if (clone.authorization)
        delete clone.authorization
    return JSON.stringify(clone)

})

morgan.token('nakedurl', (req) => {
    // url without query string
    return req.originalUrl.split('?')[0]

})

morgan.token('userId', (req) => {
    if (req.headers["authorization"]) {
        let token = req.headers["authorization"].split(' ')[1]
        let decoded = jwt.decode(token)
        return decoded.sub
    } else {
        return ("-")
    }

})

const mrg = morgan(
    ':userId :message :remote-ip :remote-port :protocol :method :body :reqheader :host :nakedurl :referrer :status :total-time :res[content-length]',
    { stream: logger.stream }
);

export default mrg