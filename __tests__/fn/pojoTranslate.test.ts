import { newDocument, pojoTranslate, getDefaultSettings } from '../../src/index';
import { createNewDocument }from '../../src/testUtils';



/* what is this supposed to test? */
test('', () => {
    const document = createNewDocument();
    const r = pojoTranslate(document);
    expect(r).toBeDefined();
});
