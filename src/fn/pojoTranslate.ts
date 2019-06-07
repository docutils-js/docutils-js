import Writer from '../writers/pojo';
import {Document} from "../types";

function pojoTranslate(document: Document) {
    const writer = new Writer();
    const output = writer.write(document, (r: any) => r);
    if (typeof output === 'undefined') {
        throw new Error('undefined output');
    }
    return output;
}

export default pojoTranslate;
