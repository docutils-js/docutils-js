import { Component } from './index';
import { AssertError } from './Exceptions';
import utils from './utils';
import Reader from './Reader';
import * as standalone from './readers/standalone';

class ReReader extends Reader {
    getTransforms() {
        return Component.getTransforms.bind(this)();
    }
}

const _reader_aliases = {};

export function getReaderClass(readerName) {
//    console.log(readerName);
    if (readerName === 'standalone') {
        return standalone.default;
    }
    throw new Error('');
}

export default {
    getReaderClass,
};
