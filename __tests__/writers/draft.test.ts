import { Publisher }
from '../../src/Core';
import { StringInput, StringOutput } from '../../src/io';
import * as nodes from '../../src/nodes';
import DraftWriter, { DraftTranslator } from '../../src/writers/draft';
import defaults from "../../gen/defaults";

const currentLogLines = [];

afterEach(() => {
    if (currentLogLines.length) {
//      console.log(currentLogLines.join('\n') + '\n');
        currentLogLines.length = 0;
    }
});

const defaultArgs = {
    readerName: 'standalone',
    parserName: 'restructuredtext',
    usage: '',
    description: '',
    enableExitStatus: true,
    writerName: 'draft',
};

const defaultSettings = { ...defaults};

test('rst2pojo pipeline', () => {
    const settings = { ...defaultSettings };
    const args = { ...defaultArgs };

/* eslint-disable-next-line no-unused-vars */
    const debugFn = (msg: string) => {
//      console.log(msg);
//      currentLogLines.push(msg);
    };

    const { readerName, parserName, writerName } = args;
    const source = new StringInput({
 source: `Random test
===========
I like food.

`,
});

    const destination = new StringOutput();
    const pub = new Publisher({
        source, destination, settings, debug: true, debugFn,
    });
    pub.setComponents(readerName, parserName, writerName);
    return new Promise((resolve, reject) => {
        pub.publish({}, (error: any) => {
            if (error) {
                reject(error);
                return;
            }
            expect(destination.destination).toBeDefined();
            expect(JSON.parse(destination.destination!)).toMatchSnapshot();
            currentLogLines.length = 0;
            resolve();
        });
    });
});

test.only('node', () => {
    const node = new nodes.paragraph('', '', [new nodes.Text('hello '), new nodes.emphasis('', 'test')], {});
    /* eslint-disable-next-line no-unused-vars */
    const writer = new DraftWriter();
    //node.reporter = { warning: () => {}, error: () => {}, debug: () => { } };
    const visitor = new DraftTranslator(node);

    node.walkabout(visitor);
});
