// import languages from './languages';
import * as xml from './writers/xml';
import * as pojo from './writers/pojo';
import * as HtmlBase from './writers/HtmlBase';
import { WriterConstructor } from './types';

export function getWriterClass(readerName: string): WriterConstructor {
    if (readerName === 'xml') {
        return xml.default;
    } if (readerName === 'pojo') {
        return pojo.default;
    } if (readerName === 'html') {
        return HtmlBase.default;
    }

    throw new Error('');
//    return require(`./writers/${readerName}.js`).default;
}

export default {
    getWriterClass,
};
