import Writer from '../writers/HtmlBase';
import {Document} from "../types";

function htmlTranslate(document: Document): string {
    const writer = new Writer({ logger:document.logger});
    // @ts-ignore
    const output = writer.write(document, (r: {}): {} => r);
    if (typeof output === 'undefined') {
        throw new Error('undefined output');
    }
    // @ts-ignore
    return output;
}

export { htmlTranslate };

export default htmlTranslate;
