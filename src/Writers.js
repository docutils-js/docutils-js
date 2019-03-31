import languages from './languages';
import { Component, __version__ } from './index';
import * as xml from './writers/xml'

export function getWriterClass(readerName) {
    if(readerName === 'xml') {
	return xml.default;
    }
    throw new Error("");
//    return require(`./writers/${readerName}.js`).default;
}

export default {
    getWriterClass
}
