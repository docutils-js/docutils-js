import Inliner from '../../../src/parsers/rst/Inliner';
import newReporter from '../../../src/newReporter';
import newDocument from '../../../src/newDocument';
import { Element } from '../../../src/nodes';
import baseSettings from '../../../src/baseSettings';
import XmlWriter from '../../../src/writers/xml';
import { StringOutput } from '../../../src/io';
import xmlescape from 'xml-escape';
import * as nodes from '../../../src/nodes';

const currentLogLines = [];

function inlineToXml(node) {
    if (node instanceof nodes.Text) {
        const text = xmlescape(node.astext());
        return text;
    }
    if (node.children.length) {
        return [node.starttag(), ...node.children.map(c => inlineToXml(c)), node.endtag()].join('');
    }
    return node.emptytag();
}

const xmlWriter = new XmlWriter({});

afterEach(() => {
    if (currentLogLines.length) {
        currentLogLines.map(line => console.log(line));
        currentLogLines.length = 0;
    }
});

function dumpNodes(nodes) {
    for (const node in nodes) {
        if (Array.isArray(node)) {
            dumpNodes(node);
            continue;
        }
        console.log(node.tagname);
        dumpNodes(nodes.children);
    }
}

test('inliner 1', () => {
    const inliner = new Inliner();
    inliner.initCustomizations({});
    const document = newDocument({}, { ...baseSettings });
    const reporter = newReporter({}, { ...baseSettings });
    let language;
    const memo = {
        document,
        reporter,
        language,
    };

    const result = inliner.parse('`test`:foo:', { lineno: 1, memo, parent: document });
    const [nodes, messages] = result;
    expect(nodes.map(n => inlineToXml(n)).join('')).toMatchSnapshot();
    expect(messages.map(n => inlineToXml(n)).join('')).toMatchSnapshot();
});

test.each([['Interpreted text', '`test`:foo:'],
           ['Emphasis', 'I like *TV*'],
           ['Bold', 'Eat **lots** of *food*.'],
           ['Literal', '``literal``'],
           ['Not sure', '_`hello`'],
           ['Interpreted text, no specified role', '`test`'],
          ])('%s', (testName, a) => {
    const inliner = new Inliner();
    inliner.initCustomizations({});
              const document = newDocument({}, { ...baseSettings });
              const reporter = newReporter({}, { ...baseSettings });
    let language;
    const memo = {
 document,
                   reporter,
                   language,
                 };

    const result = inliner.parse(a, { lineno: 1, memo, parent: document });
              const [nodes, messages] = result;
              expect(nodes.map(n => inlineToXml(n)).join('')).toMatchSnapshot();
              expect(messages.map(n => inlineToXml(n)).join('')).toMatchSnapshot();
});

/*
    if(isIterable(nodes)) {
        console.log('is iterable');
        nodes.forEach((e, i) => {
            if(typeof e === 'object' && e instanceof Element) {
                console.log(e.tagname);
            } else if(Array.isArray(e)) {
                e.forEach((e2, i2) => {
                    if(e2 instanceof Element) {
                        console.log(e.tagname);
                    } else {
                        console.log(`    ${i2}: ${e2}`);
                    }

                })
            } else {
                console.log(`${i}: ${e}`);
            }
        });

    }
*/
