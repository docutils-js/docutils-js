#!/usr/bin/env node

require('@babel/polyfill');

const fs = require('fs');

const path = require('path');
const baseSettings = require('../lib/baseSettings').default;
const parse = require('../lib/index').parse;
const PojoWriter = require('../lib/writers/pojo.js').default;

const argv = process.argv.slice(2);
const docSource = fs.readFileSync(argv[0], { encoding: 'utf-8' });
const document = parse(docSource);
if(typeof document === 'undefined') {
    throw new Error("received undefined from parse, no document");
}

const writer = new PojoWriter();
writer.translate(document);
process.stdout.write(writer.output);




