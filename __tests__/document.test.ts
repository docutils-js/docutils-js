import { newDocument } from '../src/index';
import {defaults} from '../gen/defaults';

test('newDocument', () => {
    const document = newDocument({ sourcePath: '<undefined>' }, defaults );
    expect(document).toBeDefined();
    //expect(document.settings).toBe(baseSettings);
    expect(document.reporter).toBeDefined();
    expect(document.tagname).toBe('document');
    expect(document.transformer).toBeDefined();
    expect(document.document).toBe(document);
    expect(document.attributes.source).toBe('<undefined>');
    expect(document.reporter.systemMessage).toBeDefined();
});
