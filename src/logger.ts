import winston from'winston';
import path from 'path';

export const logger = winston.createLogger({format: winston.format.json(), transports: [
new winston.transports.Console({level: 'info'}),
new winston.transports.File({filename: `${path.basename(process.argv[1])}-${process.pid}.log`, level: 'silly'}),
]});
export const child = logger.child.bind(logger);


