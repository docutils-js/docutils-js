#!/usr/bin/env node

require("@babel/polyfill");

var baseSettings = require('../lib/baseSettings').default;

var path = require('path')
function _getCallerFile() {
    var originalFunc = Error.prepareStackTrace;

    let callerfile;
    let callerlineno;
    try {
        var err = new Error();

        Error.prepareStackTrace = function (err, stack) { return stack; };

	const x = err.stack.shift();
 	const currentfile = x.getFileName();
	const currentlineno = x.getLineNumber();
	//	process.stderr.write(`${currentfile} ${currentlineno}\n`);

        while (err.stack.length) {
	    const x2 = err.stack.shift();
            callerfile = x2.getFileName();
	    callerlineno = x2.getLineNumber();

            if(currentfile !== callerfile) break;
        }
    } catch (e) {
        console.log(e);
    }

    Error.prepareStackTrace = originalFunc; 

    return [callerfile, callerlineno];
}

var _Core = require("../lib/Core");

function log(...args) {
    process.stderr.write(path.relative(__dirname,  _getCallerFile().join(':')) + ": " +args.map(x => typeof x == 'string' ? x : JSON.stringify(x)).join(' ') + "\n");
}
//console.log = log;

const argv = process.argv.slice(2);
console.log(argv);
const description = 'Generates Docutils-native XML from standalone ' + 'reStructuredText sources.  ' + _Core.defaultDescription;
(0, _Core.publishCmdLine)({
    settings: { ...baseSettings, _source: argv[0] },
    debugFn: (msg) => {
	console.log(`here ${msg}`);
    },
    argv,
    writerName: 'xml',
    description
}, (error, ...args) => {
    if(error) {
	if(error.error) {
	    throw error['error']
	} else {
	    throw error;
	}
    }
    console.log(`args is ${args}`);
});

