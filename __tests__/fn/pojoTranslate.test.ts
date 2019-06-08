import { newDocument, pojoTranslate } from '../../src/index';
import defaults from "../../gen/defaults";


/* what is this supposed to test? */
test('', () => {
    const document = newDocument({ sourcePath: '<test>' }, defaults);
    const r = pojoTranslate(document);
    expect(r).toBeDefined();
});
