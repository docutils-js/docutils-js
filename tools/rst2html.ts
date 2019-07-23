#!/usr/bin/env node

const fs = require('fs');

import path from 'path';
import { defaults, parse, StringOutput, StandaloneReader as Reader } from '../src';
const baseSettings = defaults;
import Writer from '../src/writers/HtmlBase';

const argv = process.argv.slice(2);
const settings = { ...baseSettings };

const reader = new Reader({ parseFn: parse });
const docSource = fs.readFileSync(argv[0], { encoding: 'utf-8' });
const document = reader.read2(docSource, settings);
if(typeof document === 'undefined') {
    throw new Error("received undefined from parse, no document");
}

const writer = new Writer();
const destination = new StringOutput();
//@ts-ignore
writer.write(document, destination);
process.stdout.write(JSON.stringify(writer.output));


