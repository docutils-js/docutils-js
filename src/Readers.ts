import Component from './Component';
import Reader from './Reader';
import * as standalone from './readers/standalone';

export class ReReader extends Reader {
    getTransforms() {
        return Component.getTransforms.bind(this)();
    }
}

/* eslint-disable-next-line no-unused-vars */
const _ReaderAliases = {};

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
