import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import config from 'config';
import mkpath from 'mkpath';

mkpath(config.logPath, function (err) {
    if (err) {
        throw err;
    }
});

mkpath.sync(config.logPath, 0o700);

const {
    combine,
    timestamp,
    printf,
    colorize
} = winston.format;

const customFormat = printf(info => {
    let logString = `[${process.pid}] ${info.timestamp} ${info.level}:`;

    if (info.errors) {
        for (let errObject of info.errors) {
            logString += ` ${errObject.err ? errObject.err.stack : errObject.name}`;
        }
    } else {
        logString += ` ${info.message} ${info.stack ? '- ' + info.stack : ''}`;
    }

    return logString;
});

const options = {
    level: process.env.LOG_LEVEL,
    handleExceptions: true,
    humanReadableUnhandledException: true,
    json: false,
    format: combine(
        colorize(),
        timestamp(),
        winston.format.splat(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        customFormat
    )
};

const logger = winston.createLogger({
    transports: [
        new DailyRotateFile({
            name: 'file',
            filename: config.logPath + '/api.%DATE%.log',
            colorize: true,
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxFiles: 10,
            ...options
        })
    ],
    format: combine(
        winston.format.splat(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    handleExceptions: true,
    humanReadableUnhandledException: true,
    exitOnError: false
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console(options));
}

logger.setMaxListeners(0);

// we need to redefine the .error function, since it is buggy
// see https://github.com/winstonjs/winston/issues/1338
logger.error = item => {
    const message = item instanceof Error && item.stack
        ? item.stack.replace('\n', '').replace('    ', ' - trace: ')
        : item;

    logger.log('error', message);
};

export default logger;
