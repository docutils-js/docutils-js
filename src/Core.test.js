import { publishCmdLine, defaultDescription }from './Core'
import { Source } from './Sources';

test('cmdline', async function() {
	const description = ('Generates Docutils-native XML from standalone '+
			     'reStructuredText sources.  ' + defaultDescription)
	
    await publishCmdLine({ argv: ['in.rst'], writerName: 'xml', description });
});
