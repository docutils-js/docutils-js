#!/usr/bin/env ts-node

import fs from 'fs';
import path from 'path';
import { defaults, parse, StringOutput, StandaloneReader as Reader } from '../src';
const baseSettings = defaults;
import {ArgumentParser} from 'argparse';

import Writer from '../src/writers/HtmlBase';
const keys = [
  'DocutilsCoreOptionParser',
  'DocutilsFrontendOptionParser',
  'DocutilsParsersRstParser',
//  'DocutilsWritersDocutilsXmlWriter',
//  'DocutilsWritersPepHtmlWriter',
//  'DocutilsWritersLatex2EWriter',
//  'DocutilsWritersOdfOdtWriter',
//  'DocutilsWritersOdfOdtReader',
  'DocutilsWritersHtml4Css1Writer',
//  'DocutilsWritersXetexWriter',
//  'DocutilsWritersHtml5PolyglotWriter',
//  'DocutilsWritersS5HtmlWriter',
//  'DocutilsReadersPepReader',
  'DocutilsReadersStandaloneReader'
]

const news = JSON.parse(fs.readFileSync(path.join(__dirname, '../build/newSettingsSpec.json'), { encoding:'utf-8'}));

const argParser = new ArgumentParser({});
const myArgs: {[name: string]: any} = {};
keys.forEach(key => {
    Object.keys(news[key]).forEach(subkey => {
	if(subkey !== 'help') {
	    const { opts, desc, def } = news[key][subkey];
	    let desc2 = desc;
	    const [ mainOpt ] = opts;
	    if(!myArgs[mainOpt]) {
		myArgs[mainOpt] = { opts };
		desc2 = desc.replace(/%/g, '%%');
		const o: { [name: string]: any }  = { help: desc2, dest:subkey };
		if(def) {
		    if(typeof def === 'object' && !Array.isArray(def)) {
			throw new Error(`${typeof def} ${def} ${def.toString()}`);
		    }
		    o.defaultValue = def;
		}
		argParser.addArgument(opts, o);
	    } else {
		const mOpts = myArgs[mainOpt].opts;
		if(opts.length !== mOpts.length || opts.filter((elem: string, i: number): boolean => elem !== mOpts[i]).length !== 0) {
		    throw new Error(`invalid opt set ${opts} ${mOpts}`);
		}
	    }
	}
    });
});

const args = argParser.parseArgs();
console.log(JSON.stringify(args));
process.exit(0);
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


