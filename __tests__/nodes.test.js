import * as nodes from '../src/nodes';

test('paragraph with text', ()=>{
    /* constructor(rawsource, text, children, attributes) */
    const paraText = 'This is my paragraph text.';
    const p = new nodes.paragraph(paraText, paraText, [], {});
    expect(p.toString()).toMatchSnapshot();
})
