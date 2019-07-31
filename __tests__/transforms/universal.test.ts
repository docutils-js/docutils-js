import { Decorations } from '../../src/transforms/universal';
// import * as nodes from '../../src/nodes';
import { newDocument } from '../../src/index';
import { getDefaultSettings } from "../../src/settingsHelper";
import { createNewDocument }from '../../src/testUtils';

test('Decorations.defaultPriority is 820', () => {
    expect(Decorations.defaultPriority).toBe(820);
});

test('Decorations.apply', () => {
    const document = createNewDocument();
    const startNode = document;
    const d = new Decorations(document, startNode);
    d.apply();
});

test('Decorations.apply with sourceLink', () => {
    const settings = { ...getDefaultSettings()};
    settings.sourceLink = true;
    settings._source = 'derp';
    const document = createNewDocument();
    const startNode = document;
    const d = new Decorations(document, startNode);
    d.apply();
});
