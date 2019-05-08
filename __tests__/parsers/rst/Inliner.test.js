import xmlescape from 'xml-escape';
import Inliner from '../../../src/parsers/rst/Inliner';
import newReporter from '../../../src/newReporter';
import newDocument from '../../../src/newDocument';
import { Element } from '../../../src/nodes';
import baseSettings from '../../../src/baseSettings';
import XmlWriter from '../../../src/writers/xml';
import { StringOutput } from '../../../src/io';
import { nodeToXml } from '../../../src/nodes';

const currentLogLines = [];

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
    expect(nodes.map(n => nodeToXml(n)).join('')).toMatchSnapshot();
    expect(messages.map(n => nodeToXml(n)).join('')).toMatchSnapshot();
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
              expect(nodes.map(n => nodeToXml(n)).join('')).toMatchSnapshot();
              expect(messages.map(n => nodeToXml(n)).join('')).toMatchSnapshot();
});
