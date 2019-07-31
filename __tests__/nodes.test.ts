import * as nodes from "../src/nodes";
import newDocument from "../src/newDocument";
import { nodeToXml } from "../src/nodeUtils";
import { getDefaultSettings } from'../src/';
import { createNewDocument }from '../src/testUtils';

function createNodeVisitor() {
    let document = createNewDocument();
    return new nodes.NodeVisitor(document);
}

test('paragraph with text', () => {
    /* constructor(rawsource, text, children, attributes) */
    const paraText = 'This is my paragraph text.';
    const p = new nodes.paragraph(paraText, paraText, [], {});
    expect(p.tagname).toBe('paragraph');
    expect(p.getChildren()).toHaveLength(1);
    expect(p.getChild(0)).toBeDefined();
    expect(p.getChild(0).astext()).toEqual(paraText);
    expect(nodeToXml(p)).toMatchSnapshot();
    expect(p).toMatchSnapshot();
});

test('problematic', () => {
    const p = new nodes.problematic('lala', 'lala', [], { refid: 'auto1' });
    expect(p.attributes.refid).toBe('auto1');
});
test('setId', () => {
    let d = createNewDocument();
    const p = new nodes.paragraph('test', 'test', [], {});
    d.setId(p);
});
test('paragraph text unescaped', () => {
    const text = 'escape <me>';
    const p = new nodes.paragraph(text, text, [], {});
    expect(nodeToXml(p)).toEqual(expect.stringContaining('<'));
});

test('NodeVisitor.constructor', () => {
    const visitor = createNodeVisitor();
    expect(visitor).toBeDefined();
});

test('_domNode', () => {
    const p = new nodes.paragraph('test', 'test', [], {});
});

test('firstChildNotMatchingClass', () => {
    const node = createNewDocument();
    node.add(new nodes.section());
    const index = node.firstChildNotMatchingClass(nodes.Titular);
    expect(index).toEqual(0);
});

test('firstChildNotMatchingClass 2', () => {
    const node = createNewDocument();
    node.add(new nodes.Text('hello'));
    const index = node.firstChildNotMatchingClass(nodes.Titular);
    expect(index).toEqual(0);
});
