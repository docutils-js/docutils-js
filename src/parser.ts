import Parser from './parsers/restructuredtext';
import newDocument from './newDocument';
import baseSettings from './baseSettings';
import Settings from '../gen/Settings';
import { Document } from './types';

function parse(docSource: string, settings: Settings) {
    const parser = new Parser({});
    if (typeof settings === 'undefined') {
        settings = { ...baseSettings };
    }
    const document: Document = newDocument({ sourcePath: '' }, settings);
    if (!document.reporter) {
        throw new Error('need document reporter');
    }
    parser.parse(docSource, document);
    return document;
}

export default parse;
