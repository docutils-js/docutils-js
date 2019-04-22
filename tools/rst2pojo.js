#!/usr/bin/env node

require('@babel/polyfill');

const path = require('path');
const baseSettings = require('../lib/baseSettings').default;
const docutilsCore = require('../lib/Core');
const argv = process.argv.slice(2);
const description = 'Generates Docutils-native XML from standalone reStructuredText sources.';
docutilsCore.publishCmdLine({
    settings: { ...baseSettings, _source: argv[0] },
    argv,
    writerName: 'pojo',
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
