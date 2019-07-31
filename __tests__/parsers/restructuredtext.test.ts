import * as fs from "fs";
import * as path from "path";
import Parser from "../../src/parsers/restructuredtext";
import newDocument from "../../src/newDocument";
import {nodeToXml} from "../../src/nodeUtils";
import{ getDefaultSettings} from'../../src/';
import{ createNewDocument, createLogger} from'../../src/testUtils';

const ReadmeRst = fs.readFileSync(path.join(__dirname, '../../README.rst'), { encoding: 'UTF-8' });

test.only('1', () => {
const logger = createLogger();
    const p = new Parser({ logger});
    const document = createNewDocument();
    p.parse('* a bullet point', document);
    expect(nodeToXml(document)).toMatchSnapshot();
});

test('rst parser no input', () => {
const logger = createLogger();
    const p = new Parser({logger});
    const document = createNewDocument();
    expect(() => p.parse('', document)).toThrow();
});

test('readme rst', () => {
const logger = createLogger();
    const p = new Parser({logger});
    const document = createNewDocument();
    p.parse(ReadmeRst, document);
    expect(nodeToXml(document)).toMatchSnapshot();
});
