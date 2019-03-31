import { Publisher, publishCmdLine, defaultDescription }from './Core'
import { Source } from './Sources';
import { StringInput, StringOutput } from './io'

test('cmdline', (done) => {
    const description = ('Generates Docutils-native XML from standalone '+
			     'reStructuredText sources.  ' + defaultDescription)
    
    publishCmdLine({ argv: ['in.rst'], writerName: 'xml', description },
		   (...args) => {
		       done();
		   })
});
test.skip('1',  done => {
    const args = { readerName: 'standalone',
		   parserName: 'restructuredtext',
		   usage: '',
		   description: '',
		   enableExitStatus: true,
		   writerName: 'xml' };

    const { readerName, parserName, writerName } = args;
    const source = new StringInput({source: "test"})
    const destination = new StringOutput({})
    const settings = {}
    const pub = new Publisher({source, destination, settings});
    pub.setComponents(readerName, parserName, writerName);
    pub.publish({}, 		   (...args) => {
        console.log(destination.destination);
	done();
    });
})

