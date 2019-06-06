import * as standalone from './fn/standaloneReader';
import newDocument from './newDocument';
import baseSettings from './baseSettings';
import restParse from './fn/restructuredText';

function parse(docSource, settings) {
    if (typeof settings === 'undefined') {
        settings = { ...baseSettings };
    }
    const document = newDocument({ sourcePath: '' }, settings);
    if (!document.reporter) {
        throw new Error('need document reporter');
    }
    return restParse(docSource, document);
}

export default parse;
