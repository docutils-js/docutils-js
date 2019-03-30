import { publishCmdLine, defaultDescription }from './src/Core'
import { Source } from './src/Sources';

const description = ('Generates Docutils-native XML from standalone '+
		     'reStructuredText sources.  ' + defaultDescription)
    
publishCmdLine({ argv: ['in.rst'], writerName: 'xml', description },
	       (...args) => {
		   done();
	       })
