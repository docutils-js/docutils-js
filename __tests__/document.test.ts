import { newDocument } from '../src/index';
import { getDefaultSettings } from '../src/';
import { LoggerType } from '../src/types';
import { createNewDocument } from '../src/testUtils';

declare var logger: LoggerType;

test('newDocument', () => {
    const document = createNewDocument('<undefined>');
    expect(document).toBeDefined();
    //expect(document.settings).toBe(baseSettings);
    expect(document.reporter).toBeDefined();
    expect(document.tagname).toBe('document');
    expect(document.transformer).toBeDefined();
    expect(document.document).toBe(document);
    expect(document.attributes.source).toBe('<undefined>');
    expect(document.reporter.systemMessage).toBeDefined();
});
