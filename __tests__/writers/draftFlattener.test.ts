import * as fs from 'fs';
import * as path from 'path';
import { Publisher } from '../../src/Core';
import { StringInput, StringOutput } from '../../src/io';
import baseSettings from '../../src/baseSettings';
import * as nodes from '../../src/nodes';

jest.mock('../../src/io/Output');

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

const defaultSettings = { ...baseSettings };

test.skip('rst2pojo pipeline', () => {
    const src = fs.readFileSync(path.join(__dirname, '../../testfiles/docs/index.txt'), { encoding: 'utf-8' });

    const settings = { ...defaultSettings };
    const args = { ...defaultArgs };

    /* eslint-disable-next-line no-unused-vars */
    const debugFn = (msg) => {
//      console.log(msg);
//      currentLogLines.push(msg);
    };

    const { readerName, parserName, writerName } = args;
    const source = new StringInput({
        source: src,
});

    const destination = new StringOutput({});
    const pub = new Publisher({
        source, destination, settings, debug: true, debugFn,
    });
    pub.setComponents(readerName, parserName, writerName);
    return new Promise((resolve, reject) => {
        pub.publish({}, (error) => {
            if (error) {
                reject(error);
                return;
            }
            fs.writeFileSync(nodes.formatXml(nodeToXmldestination.destination), 'out.xml', 'utf-8');
            currentLogLines.length = 0;
            resolve();
        });
    });
});
