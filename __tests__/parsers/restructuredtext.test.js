import { Parser } from '../../src/parsers/restructuredtext';
import { newDocument } from '../../src/utils';
import baseSettings from '../../src/baseSettings';

test('1', () => {
    const p = new Parser({});
    const document = newDocument({ sourcePath: '' }, baseSettings);
    p.parse('* a bullet point', document);
    expect(document.toString()).toMatchSnapshot();
});

test('rst parser no input', () => {
    const p = new Parser({});
    const document = newDocument({ sourcePath: '' }, baseSettings);
    expect(() => p.parse('', document)).toThrow();
});
