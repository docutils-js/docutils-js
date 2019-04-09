import { Parser } from '../../src/parsers/restructuredtext';
import { newDocument } from '../../src/utils';

test.skip('1', () => {
    const p = new Parser({});
    const document = newDocument({ sourcePath: '' }, {});
    p.parse('* a bullet point', document);
    expect(document.toString()).toMatchSnapshot();
});
