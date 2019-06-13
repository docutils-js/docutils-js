import Component from './Component';
import Reader from './Reader';
import * as standalone from './readers/standalone';
import { ApplyFunction } from "./types";

export class ReReader extends Reader {
    public getTransforms(): ApplyFunction[] {
        // @ts-ignore
        return Component.getTransforms.bind(this)();
    }
}

/* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
const _ReaderAliases = {};

export function getReaderClass(readerName: string): {} {
//    console.log(readerName);
    if (readerName === 'standalone') {
        return standalone.default;
    }
    throw new Error('');
}

export default {
    getReaderClass,
};
