import { document } from '../../src/nodes';

test('document.constructor', () => {
    const doc = new document();
});

test('document.getDecoration', () => {
    const doc = new document();
    const dec = doc.getDecoration();
    console.log(dec);
});

