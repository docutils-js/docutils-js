import Parser from './parsers/restructuredtext';
import newDocument from './newDocument';
import baseSettings from './baseSettings';

function parse(docSource, settings) {
    const parser = new Parser({});
    if(typeof settings === 'undefined') {
	settings = { ... baseSettings };
    }
    const document = newDocument({sourcePath: ''}, settings);
    parser.parse(docSource, document);
    return document;    
}
