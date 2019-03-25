import { publishCmdLine, defaultDescription }from './Core'
import { Source } from './Sources';

test('cmdline', (done) => {
    const description = ('Generates Docutils-native XML from standalone '+
			     'reStructuredText sources.  ' + defaultDescription)
    
    publishCmdLine({ argv: ['in.rst'], writerName: 'xml', description },
		   (...args) => {
		       done();
		   })
});

