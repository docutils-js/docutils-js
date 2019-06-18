import * as fs from 'fs';
import * as path from 'path';
import Parser from '../../src/parsers/restructuredtext';
import newDocument from '../../src/newDocument';
import * as nodes from '../../src/nodes';
import { defaults } from "../../gen/defaults";

defaults.docutilsCoreOptionParser!.debug = true;


const ReadmeRst = fs.readFileSync(path.join(__dirname, '../../README.rst'), { encoding: 'UTF-8' });

test.only('1', () => {
    const p = new Parser({});
    const document = newDocument({ sourcePath: '' }, defaults);
    p.parse('* a bullet point', document);
    expect(nodes.nodeToXml(document)).toMatchSnapshot();
});

test('rst parser no input', () => {
    const p = new Parser({});
    const document = newDocument({ sourcePath: '' }, defaults);
    expect(() => p.parse('', document)).toThrow();
});

test('readme rst', () => {
    const p = new Parser({});
    const document = newDocument({ sourcePath: '' }, defaults);
    p.parse(ReadmeRst, document);
    expect(nodes.nodeToXml(document)).toMatchSnapshot();
});
