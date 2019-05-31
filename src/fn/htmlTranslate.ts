import Writer from '../writers/HtmlBase';

function htmlTranslate(document) {
    const writer = new Writer();
    const output = writer.write(document, r => r);
    if (typeof output === 'undefined') {
        throw new Error('undefined output');
    }
    return output;
}

export default htmlTranslate;
