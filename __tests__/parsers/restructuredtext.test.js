import * as fs from 'fs';
import * as path from 'path';
import Parser from '../../src/parsers/restructuredtext';
import newDocument from '../../src/newDocument';
import baseSettings from '../../src/baseSettings';
import * as nodes from '../../src/nodes';

const ReadmeRst = fs.readFileSync(path.join(__dirname, '../../README.rst'), { encoding: 'UTF-8' });

test('1', () => {
    const p = new Parser({});
    const document = newDocument({ sourcePath: '' }, baseSettings);
    p.parse('* a bullet point', document);
    expect(nodes.formatXml(nodeToXmldocument)).toMatchSnapshot();
});

test('rst parser no input', () => {
    const p = new Parser({});
    const document = newDocument({ sourcePath: '' }, baseSettings);
    expect(() => p.parse('', document)).toThrow();
});

test('readme rst', () => {
    const p = new Parser({});
    const document = newDocument({ sourcePath: '' }, baseSettings);
    p.parse(ReadmeRst, document);
    expect(nodes.formatXml(nodeToXml(document)).toMatchSnapshot();
});
