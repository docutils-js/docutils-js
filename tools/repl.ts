import readline from 'readline';
import RSTStateMachine from '../src/parsers/rst/RSTStateMachine';
import StateFactory from '../src/parsers/rst/StateFactory';
import { newDocument } from '../src/newDocument';
import {getDefaultSettings} from "../src/settingsHelper";
import { nodeToXml } from '../src/nodeUtils';
import winston from 'winston';

const consoleTransport  = new winston.transports.Console({level: 'debug'});
const file = new winston.transports.File({level: 'debug', filename:
      'repl.log'})
const loggerTransports = [consoleTransport, file];
const logger = winston.createLogger({format: winston.format.json(),
transports:loggerTransports});

const stateMachine = new RSTStateMachine({
            stateFactory: new StateFactory(),
            initialState: 'Body',
            debugFn: (arg) => logger.debug(arg),
            debug: true});
	   const document = newDocument({sourcePath: ''}, getDefaultSettings());

const rl = readline.createInterface({input: process.stdin, output: process.stdout});


rl.prompt();
rl.on('line',(line: string) => {
stateMachine.run([line], 0, undefined, undefined, undefined, document, true, undefined);
console.log(nodeToXml(document));
rl.prompt();
});

rl.on('close', () => {
});
