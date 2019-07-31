import { newDocument } from './newDocument';
import newReporter    from './newReporter';
import { defaultPublisherOptions } from '../src/constants';
import { getDefaultSettings } from './settingsHelper';
import winston, { format, transports, LoggerOptions, Logger } from 'winston';
import { defaultConsoleLogLevel } from './constants';
import {Publisher} from './Publisher';
import path from 'path';
import StateFactory from './parsers/rst/StateFactory';
import { LoggerType } from './types';
import process from 'process';

let logger: LoggerType|undefined;

export function createLogger(options?: LoggerOptions): Logger {
    if(logger !== undefined) {
        return logger;
    }
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
    logger = winston.createLogger(myOpt);
    return logger;
}

export function createPublisher() {
    const publisher = new Publisher({ ...defaultPublisherOptions, logger: createLogger() });
    publisher.setComponents(defaultPublisherOptions.readerName, defaultPublisherOptions.parserName, 'xml');
    return publisher;
}

export function createStateMachine() {
}

export function createStateFactory(): StateFactory {
return new StateFactory({ logger: createLogger() });
}

export function createNewDocument(sourcePath: string='default') {
    return newDocument({sourcePath, logger: createLogger()}, getDefaultSettings());
}
  
export function createNewReporter(sourcePath: string='default') {
    return newReporter({sourcePath}, getDefaultSettings());
}
