#!/usr/bin/env ts-node
import { publishCmdLine } from '../src/Core';
import { createLogger } from '../src/logger';
import { defaultDescription } from '../src/constants';

const logger = createLogger({level: 'debug', defaultMeta: { program: 'rst2xml'}});

const description = `Generates (X)HTML documents from standalone reStructuredText sources.  ${defaultDescription}`;

publishCmdLine({logger, writerName: 'xml', description }, (error: Error, output: any): void => {
    if(error) {
        console.log(error.stack);
        console.log(error.message);
    } else {
        console.log(output);
        process.exit(0);
    }
});
