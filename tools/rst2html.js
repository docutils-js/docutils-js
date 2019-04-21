#!/usr/bin/env node

require('@babel/polyfill');

const path = require('path');
const baseSettings = require('../lib/baseSettings').default;
baseSettings.haltLevel = 100;


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

const _Core = require('../lib/Core');

function log(...args) {
    process.stderr.write(`${path.relative(__dirname, _getCallerFile().join(':'))}: ${args.map(x => (typeof x === 'string' ? x : JSON.stringify(x))).join(' ')}\n`);
}
// console.log = log;

const argv = process.argv.slice(2);
const description = 'Generates Docutils-native XML from standalone reStructuredText sources.';
(0, _Core.publishCmdLine)({
    settings: { ...baseSettings, _source: argv[0] },
    argv,
    writerName: 'html',
    description,
}, (error, ...args) => {
    if (error) {
        if (error.error) {
            throw error.error;
        } else {
            throw error;
        }
    }
});
