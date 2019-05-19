import { newDocument, baseSettings } from '../src/index';

test('newDocument', () => {
    const document = newDocument({ sourcePath: '<undefined>' }, baseSettings);
    expect(document).toBeDefined();
    expect(document.settings).toBe(baseSettings);
    expect(document.reporter).toBeDefined();
    expect(document.tagname).toBe('document');
    expect(document.transformer).toBeDefined();
    expect(document.document).toBe(document);
    expect(document.attributes.source).toBe('<undefined>');
    expect(document.reporter.systemMessage).toBeDefined();
});
