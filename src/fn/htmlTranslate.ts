import Writer from '../writers/HtmlBase';
import {Document} from "../types";

function htmlTranslate(document: Document) {
    const writer = new Writer();
    const output = writer.write(document, (r: any) => r);
    if (typeof output === 'undefined') {
        throw new Error('undefined output');
    }
    return output;
}

export { htmlTranslate };

export default htmlTranslate;
