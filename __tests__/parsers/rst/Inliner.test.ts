// @ts-ignore
import formatXml from 'xml-formatter';
import Inliner from '../../../src/parsers/rst/Inliner';
import newReporter from '../../../src/newReporter';
import newDocument from '../../../src/newDocument';

import{ NodeInterface} from "../../../src/types";
import { nodeToXml } from "../../../src/nodeUtils";
import { createNewDocument, createLogger } from '../../../src/testUtils';
import { getDefaultSettings } from '../../../src/';

const currentLogLines: string[] = [];

afterEach(() => {
    if (currentLogLines.length) {
        /* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
        currentLogLines.forEach((line) => {});
        currentLogLines.length = 0;
    }
});

test('inliner 1', () => {
    const document = createNewDocument();
    const inliner = new Inliner(document, document.logger);
    inliner.initCustomizations({...getDefaultSettings()});
    const reporter = newReporter({ sourcePath: ''}, { ...getDefaultSettings()});
    let language;
    const memo = {
        document,
        reporter,
        language,
    };

    const result = inliner.parse('`test`:foo:', { lineno: 1, memo, parent: document });
    const [nodes, messages] = result;
    expect(nodes.map((n: NodeInterface): string => formatXml(nodeToXml(n))).join('')).toMatchSnapshot();
    expect(messages.map((n: NodeInterface): string => formatXml(nodeToXml(n))).join('')).toMatchSnapshot();
});

test.each([['Interpreted text', '`test`:foo:'],
           ['Emphasis', 'I like *TV*'],
           ['Bold', 'Eat **lots** of *food*.'],
           ['Literal', '``literal``'],
           ['Not sure', '_`hello`'],
           ['Interpreted text, no specified role', '`test`'],
          ])('%s', (testName, a) => {
              const document = createNewDocument();
    const inliner = new Inliner(document,document.logger);
    inliner.initCustomizations({...getDefaultSettings()});
              const reporter = newReporter({ sourcePath:''}, { ...getDefaultSettings()});
    let language;
    const memo = {
 document,
                   reporter,
                   language,
                 };

    const result = inliner.parse(a, { lineno: 1, memo, parent: document });
              const [nodes, messages] = result;
    expect(nodes.map((n: NodeInterface): string => formatXml(nodeToXml(n))).join('')).toMatchSnapshot();
    expect(messages.map((n: NodeInterface): string => formatXml(nodeToXml(n))).join('')).toMatchSnapshot();
});
