import Parser from './parsers/restructuredtext';
import newDocument from './newDocument';
import baseSettings from './baseSettings';

function parse(docSource, settings) {
    const parser = new Parser({});
    if (typeof settings === 'undefined') {
	settings = { ...baseSettings };
    }
    const document = newDocument({ sourcePath: '' }, settings);
    if (!document.reporter) {
	throw new Error('need document reporter');
    }
    parser.parse(docSource, document);
    return document;
}

export default parse;
