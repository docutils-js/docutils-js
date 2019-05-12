import {newDocument, pojoTranslate,baseSettings } from '../../src/index';


test('', () => {
    const document = newDocument({ sourcePath: '<test>'}, baseSettings);
    const r = pojoTranslate(document);
    expect(r).toBeDefined();
});
