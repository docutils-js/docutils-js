import * as nodes from '../src/nodes';
import newDocument from '../src/newDocument';
import defaults from "../gen/defaults";

function createNodeVisitor() {
    let document = newDocument({sourcePath: ""}, defaults);
    return new nodes.NodeVisitor(document);
}

test('paragraph with text', () => {
    /* constructor(rawsource, text, children, attributes) */
    const paraText = 'This is my paragraph text.';
    const p = new nodes.paragraph(paraText, paraText, [], {});
    expect(p.tagname).toBe('paragraph');
    expect(p.children).toHaveLength(1);
    expect(p.children[0]).toBeDefined();
    expect(p.children[0].astext()).toEqual(paraText);
    expect(nodes.nodeToXml(p)).toMatchSnapshot();
    expect(p).toMatchSnapshot();
});

test('problematic', () => {
    const p = new nodes.problematic('lala', 'lala', [], { refid: 'auto1' });
    expect(p.attributes.refid).toBe('auto1');
});
test('setId', () => {
    const d = newDocument({ sourcePath: ''}, defaults );
    const p = new nodes.paragraph('test', 'test', [], {});
    d.setId(p);
});
test('paragraph text unescaped', () => {
    const text = 'escape <me>';
    const p = new nodes.paragraph(text, text, [], {});
    expect(nodes.nodeToXml(p)).toEqual(expect.stringContaining('<'));
});

test('NodeVisitor.constructor', () => {
    const visitor = createNodeVisitor();
    expect(visitor).toBeDefined();
});

test('_domNode', () => {
    const p = new nodes.paragraph('test', 'test', [], {});
});

test('firstChildNotMatchingClass', () => {
    const node = newDocument({ sourcePath: ''}, defaults)
    node.children.push(new nodes.section());
    const index = node.firstChildNotMatchingClass(nodes.Titular);
    expect(index).toEqual(0);
});

test('firstChildNotMatchingClass 2', () => {
    const node = newDocument({ sourcePath: ''}, defaults)
    node.children.push(new nodes.Text('hello'));
    const index = node.firstChildNotMatchingClass(nodes.Titular);
    expect(index).toEqual(0);
});
