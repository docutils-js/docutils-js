import * as nodes from '../src/nodes';
import { newDocument } from '../src/utils';

test('paragraph with text', () => {
    /* constructor(rawsource, text, children, attributes) */
    const paraText = 'This is my paragraph text.';
    const p = new nodes.paragraph(paraText, paraText, [], {});
    expect(p.toString()).toMatchSnapshot();
});

test.only('problematic', () => {
    const p = new nodes.problematic('lala', 'lala', [], { refid: 'auto1' });
    expect(p.attributes.refid).toBe('auto1');
});
test('setId', () => {
    const d = newDocument({}, { idPrefix: '', autoIdPrefix: 'auto' });
    const p = new nodes.paragraph('test', 'test', [], {});
    const id = d.setId(p);
    console.log(id);
});
