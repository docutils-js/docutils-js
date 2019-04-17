//import languages from './languages';
import Component from './Component';
import { __version__ } from './index';
import * as xml from './writers/xml';
import * as pojo from './writers/pojo';

export function getWriterClass(readerName) {
    if (readerName === 'xml') {
        return xml.default;
    } if (readerName === 'pojo') {
        return pojo.default;
    }

    throw new Error('');
//    return require(`./writers/${readerName}.js`).default;
}

export default {
    getWriterClass,
};
