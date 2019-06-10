// @ts-ignore
import { handlers } from '../plugins/restructuredtext';

test.skip('', () => {
    const doclet = { description: 'test' };
    handlers.newDoclet({ doclet });
    expect(doclet.description).toBeDefined();
});
