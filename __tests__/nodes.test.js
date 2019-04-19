import * as nodes from '../src/nodes';
import newDocument from "../src/newDocument";
import baseSettings from '../src/baseSettings'
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
import { DOMParser, DOMImplementation, XMLSerializer } from 'xmldom';

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
    expect(p.toString()).toMatchSnapshot();
    expect(p).toMatchSnapshot();
});

test('problematic', () => {
    const p = new nodes.problematic('lala', 'lala', [], { refid: 'auto1' });
    expect(p.attributes.refid).toBe('auto1');
});
test('setId', () => {
    const d = newDocument({}, baseSettings);
    const p = new nodes.paragraph('test', 'test', [], {});
    const id = d.setId(p);
});
test('paragraph text unescaped', () =>
{
    const d = newDocument({}, baseSettings);
    const text = 'escape <me>';
    const p = new nodes.paragraph(text, text, [], {});
    expect(p.toString()).toEqual(expect.stringContaining('<'));
})

test('NodeVisitor.constructor', () => {
    const visitor = createNodeVisitor();
    
});

test('_domNode', () => {
    const dom = new JSDOM();
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
    
