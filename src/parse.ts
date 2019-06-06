import * as standalone from './fn/standaloneReader';
import newDocument from './newDocument';
import restParse from './fn/restructuredText';
import {Settings} from "../gen/Settings";

function parse(docSource: string, settings?: Settings) {
    const document = newDocument({ sourcePath: '' }, settings);
    if (!document.reporter) {
        throw new Error('need document reporter');
    }
    return restParse(docSource, document);
}

export default parse;
