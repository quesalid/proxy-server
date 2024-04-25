import loggers from './logger.js'

const logger = loggers.simple

const errorHandler = (error, req, res, next) => {
    // Error handling middleware functionality
    logger.error(`PROXYSERV error ${error.message} ${error.code} from  ${req.ip}` ) // log the error
    console.log(error)
    const status = error.status || 500
    res.body = error.message
    res.status(status).send(error)
}

export default errorHandler