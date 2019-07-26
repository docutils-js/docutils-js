import fs from 'fs'
import { ArgumentParser } from 'argparse';

const parser = new ArgumentParser({});
parser.addArgument('--filter', { action: 'append' });
parser.addArgument('input');
const args = parser.parseArgs();
console.log(args);

const fields: string[] = [];
const fieldMap: { [fieldName: string]: number } = {};

const input = fs.createReadStream(args.input, { encoding: 'utf-8' });
let lastLine = '';
input.on('data', (chunk: string) => {
   let data = lastLine + chunk;
   let newline;
   while((newline = data.indexOf('\n')) !== -1) {
   let e;
   try {
   e = data.substring(0, newline);
     const logEntry = JSON.parse(e);
     Object.keys(logEntry).forEach((k: string): void => {
     if(!(k in fieldMap)) {
     fields.push(k);
     fieldMap[k] = fields.length - 1;
     }
     });
     console.log(fields.map(field => logEntry[field] ? logEntry[field].toString().substring(0, 80): '').join('\t'));
     } catch(error) {
     throw error;
     throw new Error(e);
     }
     data = data.substring(newline + 1);
     }
     lastLine = data;
     });
input.on('end', () => {});
