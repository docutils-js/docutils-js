import { Publisher, publishCmdLine, defaultDescription } from '../../src/Core';
import { Source } from '../../src/Sources';
import { StringInput, StringOutput } from '../../src/io';
import Output from '../../src/io/Output';
jest.mock('../../src/io/Output');

const currentLogLines = [];

afterEach(() => {
    if(currentLogLines.length) {
	console.log(currentLogLines.join('\n') + '\n');
	currentLogLines.length = 0;
    }
});

const defaultArgs = {
    readerName: 'standalone',
    parserName: 'restructuredtext',
    usage: '',
    description: '',
    enableExitStatus: true,
    writerName: 'pojo',
};

/* should pull from baseSettings */
const defaultSettings = {
    debug: true,
    autoIdPrefix: 'auto',
    idPrefix: '',
};

test.only('rst2pojo pipeline', () => {
    const settings = { ...defaultSettings };
    const args = { ...defaultArgs };

    const debugLog = [];
    const debugFn = (msg) => {
	console.log(msg);
//	currentLogLines.push(msg);
    };

    const { readerName, parserName, writerName } = args;
    const source = new StringInput({ source: `Random test
===========
I like food.

`});
    
    const destination = new StringOutput({});
    const pub = new Publisher({
	source, destination, settings, debug: true, debugFn
    });
    pub.setComponents(readerName, parserName, writerName);
    return new Promise((resolve, reject) => {
	pub.publish({}, (error, ...args) => {
	    if (error) {
		reject(error);
		return;
	    }
	    expect(JSON.parse(destination.destination)).toMatchSnapshot();
	    currentLogLines.length = 0;
	    resolve();
	});
    });
});

