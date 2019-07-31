import winston, { Logger, LoggerOptions, format, transports } from'winston';
import path from 'path';
import { LoggerType } from './types';
import { defaultConsoleLogLevel} from './constants';

export const loggers: { [loggerName: string]: Logger } = {};

export function createLogger(options?: LoggerOptions): Logger {
    let myOpt = options === undefined ? {} : { ...options};
    if(myOpt.format === undefined) {
        myOpt.format = format.json();
    }
    if(myOpt.transports === undefined) {
        myOpt.transports = [
            new transports.Console({level: defaultConsoleLogLevel}),
            new transports.File({filename: `${path.basename(process.argv[1])}-${process.pid}.log`, level: 'silly'}),
        ];
    }
    const l = winston.createLogger(myOpt);
    loggers.root = l;
    return l;
}

export function getLogger(): LoggerType {
    return loggers.root;
}

export const logger = createLogger();
export const child = () => {throw new Error('redo logger');}


