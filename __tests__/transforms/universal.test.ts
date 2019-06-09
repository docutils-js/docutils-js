import { Decorations } from '../../src/transforms/universal';
// import * as nodes from '../../src/nodes';
import { newDocument } from '../../src/index';
import defaults from "../../gen/defaults";

test('Decorations.defaultPriority is 820', () => {
    expect(Decorations.defaultPriority).toBe(820);
});

test('Decorations.apply', () => {
    const document = newDocument({ sourcePath: '<undefined>' }, defaults);
    const startNode = document;
    const d = new Decorations(document, startNode);
    d.apply();
});

test('Decorations.apply with sourceLink', () => {
    const settings = { ...defaults};
    settings.docutilsCoreOptionParser!.sourceLink = true;
    settings._source = 'derp';
    const document = newDocument({ sourcePath: '<undefined>' }, settings);
    const startNode = document;
    const d = new Decorations(document, startNode);
    d.apply();
});
