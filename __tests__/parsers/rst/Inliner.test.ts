import formatXml from 'xml-formatter';
import Inliner from '../../../src/parsers/rst/Inliner';
import newReporter from '../../../src/newReporter';
import newDocument from '../../../src/newDocument';
import baseSettings from '../../../src/baseSettings';
import { nodeToXml } from '../../../src/nodes';

const currentLogLines = [];

afterEach(() => {
    if (currentLogLines.length) {
        /* eslint-disable-next-line no-unused-vars */
        currentLogLines.forEach((line) => {});
        currentLogLines.length = 0;
    }
});

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
    expect(nodes.map(n => formatXml(nodeToXml(n))).join('')).toMatchSnapshot();
    expect(messages.map(n => formatXml(nodeToXml(n))).join('')).toMatchSnapshot();
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
              expect(nodes.map(n => formatXml(nodeToXml(n))).join('')).toMatchSnapshot();
              expect(messages.map(n => formatXml(nodeToXml(n))).join('')).toMatchSnapshot();
});
