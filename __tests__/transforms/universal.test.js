import { Decorations } from '../../src/transforms/universal';
// import * as nodes from '../../src/nodes';
import { newDocument, baseSettings } from '../../src/index';

test('Decorations.defaultPriority is 820', () => {
    expect(Decorations.defaultPriority).toBe(820);
});

test('Decorations.apply', () => {
    const document = newDocument({ sourcePath: '<undefined>' }, baseSettings);
    const startNode = document;
    const d = new Decorations(document, startNode);
    d.apply();
});

test('Decorations.apply with sourceLink', () => {
    const settings = { ...baseSettings };
    settings.sourceLink = true;
    settings._source = 'derp';
    const document = newDocument({ sourcePath: '<undefined>' }, settings);
    const startNode = document;
    const d = new Decorations(document, startNode);
    d.apply();
});
