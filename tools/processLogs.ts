import fs from 'fs'
import { ArgumentParser } from 'argparse';

export const EnterFunction = 'enterFunction';
export interface EnterFunctionLogEntry extends Omit<LogEntry, 'kind'> {
  kind: typeof EnterFunction;
  function: string;
}
export type LogEntryTypes = EnterFunctionLogEntry;

export interface LogEntry {
message?: string;
level?: string;
kind: string;
[propName: string]: any;
}

const parser = new ArgumentParser({});
parser.addArgument('--filter', { action: 'append' });
parser.addArgument('input');
const args = parser.parseArgs();
console.log(args);

if(args.filter) {
args.filter.map((f: string): (a: LogEntry) => boolean => {
const [k, v] = f.split(/=/, 2);
return (a) => a[k] === v;
});
}

const fields: string[] = [];
const fieldMap: { [fieldName: string]: number } = {};
const logEntries: Array<LogEntry> = [];
const input = fs.createReadStream(args.input, { encoding: 'utf-8' });
let lastLine = '';
input.on('data', (chunk: string) => {
    let data = lastLine + chunk;
    let newline;
    while((newline = data.indexOf('\n')) !== -1) {
        let e;
        try {
            e = data.substring(0, newline);
            const logEntry: LogEntryTypes = JSON.parse(e);
            Object.keys(logEntry).forEach((k: string): void => {
                if(!(k in fieldMap)) {
                    fields.push(k);
                    fieldMap[k] = fields.length - 1;
                }
            });
            logEntries.push(logEntry);
        } catch(error) {
            throw error;
            throw new Error(e);
        }
        data = data.substring(newline + 1);
    }
    lastLine = data;
});
input.on('end', () => {
console.log(fields.map(field => field.padStart(24, ' ')).join(' | '));
logEntries.forEach((logEntry): void => {
// @ts-ignore
console.log(fields.map(field => (logEntry[field] ? logEntry[field].toString().substring(0, 24): '').padStart(24, ' ')).join(' | '));
});
});
