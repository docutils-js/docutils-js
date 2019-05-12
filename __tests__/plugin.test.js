import { handlers } from '../plugins/restructuredtext';

test('', () => {
    global.env = { conf: { } };
    const doclet = { description: 'test' };
    handlers.newDoclet({doclet});
    console.log(doclet);
    expect(doclet.description).toBeDefined();
});
