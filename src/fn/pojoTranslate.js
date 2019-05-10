import Writer from '../writers/pojo';

export default function pojoTranslate(document) {
    const writer = new Writer();
    const output = writer.write(document, r => r);
    console.log(output);
}
