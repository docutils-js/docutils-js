import { /* DOMParser, DOMImplementation, */ XMLSerializer } from 'xmldom';
import * as nodes from '../src/nodes';
import newDocument from '../src/newDocument';
import baseSettings from '../src/baseSettings';

function createNodeVisitor() {
    return new nodes.NodeVisitor({ reporter: { debug: () => {} } });
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
    const d = newDocument({}, baseSettings);
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
    const domParser = new DOMParser({});
    const doc = domParser.parseFromString('<document/>');
    const domRoot = doc;
    expect(domRoot).toBeDefined();
    const serializer = new XMLSerializer();

    const domNode = p._domNode(domRoot);
    expect(domNode).toBeDefined();

    const stringRep = serializer.serializeToString(domNode);
    expect(stringRep).toMatchSnapshot();
});

test('firstChildNotMatchingClass', () => {
    const node = new nodes.document();
    node.children.push(new nodes.section());
    const index = node.firstChildNotMatchingClass(nodes.Titular);
    expect(index).toEqual(0);
});

test('firstChildNotMatchingClass 2', () => {
    const node = new nodes.document();
    node.children.push(new nodes.Text('hello'));
    const index = node.firstChildNotMatchingClass(nodes.Titular);
    expect(index).toEqual(0);
});
