import Component from './Component';
import Reader from './Reader';
import * as standalone from './readers/standalone';

export class ReReader extends Reader {
    getTransforms() {
        return Component.getTransforms.bind(this)();
    }
}

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
