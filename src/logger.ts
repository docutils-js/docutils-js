import winston from'winston';

export const logger = winston.createLogger({format: winston.format.json(), transports: [new winston.transports.Console({level: 'silly'})]});


