import Writer from '../writers/pojo';

function pojoTranslate(document) {
    const writer = new Writer();
    const output = writer.write(document, r => r);
    if (typeof output === 'undefined') {
        throw new Error('undefined output');
    }
    return output;
}

export default pojoTranslate;
