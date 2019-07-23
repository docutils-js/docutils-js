#!/usr/bin/env node

require('@babel/polyfill');

const fs = require('fs');

//const logSocket = fs.createWriteStream('/dev/log');
//logSocket.write('test');

const path = require('path');
const baseSettings = require('../lib/src').defaults;
const parse = require('../lib/src/index').parse;
const StringOutput = require('../lib/src/index').StringOutput;
const Writer = require('../lib/src/writers/HtmlBase.js').default;
const Reader = require('../lib/src/index').StandaloneReader;

const argv = process.argv.slice(2);
const settings = { ...baseSettings };

function _getCallerFile() {
    const originalFunc = Error.prepareStackTrace;

    let callerfile;
    let callerlineno;
    try {
        const err = new Error();

        Error.prepareStackTrace = (myErr, stack) => stack;

        const x = err.stack.shift();
        const currentfile = x.getFileName();
//        const currentlineno = x.getLineNumber();
        //      process.stderr.write(`${currentfile} ${currentlineno}\n`);

        while (err.stack.length) {
            const x2 = err.stack.shift();
            callerfile = x2.getFileName();
            callerlineno = x2.getLineNumber();

            if (currentfile !== callerfile) break;
        }
    } catch (e) {
        console.log(e);
    }

    Error.prepareStackTrace = originalFunc;

    return [callerfile, callerlineno];
}

function log(...args) {
    process.stderr.write(`${path.relative(__dirname, _getCallerFile().join(':'))}: ${args.map(x => (typeof x === 'string' ? x : JSON.stringify(x))).join(' ')}\n`);
}
console.log = log;

const reader = new Reader({ parseFn: parse });
const docSource = fs.readFileSync(argv[0], { encoding: 'utf-8' });
const document = reader.read2(docSource, settings);
if(typeof document === 'undefined') {
    throw new Error("received undefined from parse, no document");
}

const writer = new Writer();
const destination = new StringOutput();
writer.write(document, destination);
process.stdout.write(JSON.stringify(writer.output));


