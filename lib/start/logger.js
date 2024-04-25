import winston from 'winston'
import * as rotator from 'winston-daily-rotate-file'
const createLogger = winston.createLogger
const transports = winston.transports
const format = winston.format

var transport = new winston.transports.DailyRotateFile({
    filename: 'LOM-%DATE%.log',
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: process.env.WINSTON_MAXFILES ? process.env.WINSTON_MAXFILES:'14d',
    dirname:'./logs'
});

transport.on('rotate', function (oldFilename, newFilename) {
    // do something fun
});

const loggers = {
    simple:createLogger({
            format: format.combine(
                format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
                format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
            ),
            transports: [
                transport,
                new transports.Console(),
            ]
    }),
    splat: createLogger({
        format: format.combine(
            format.splat(),
            format.simple()
        ),
        transports: [
            new winston.transports.Stream({
                stream: process.stderr,
                level: 'info',
            })
        ]
    })
}

export default loggers;