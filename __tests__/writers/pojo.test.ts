import { Publisher } from '../../src/Core';
import { StringInput, StringOutput } from '../../src/io';
import { getDefaultSettings } from '../../src/';
import { createLogger }from '../../src/testUtils';

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
    writerName: 'pojo',
};

const defaultSettings = { ...getDefaultSettings()};

test('rst2pojo pipeline', () => {
    const settings = { ...defaultSettings };
    const args = { ...defaultArgs };
    const logger = createLogger();

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
    const debugFn = (msg: string) => {
        //      console.log(msg);
        //      currentLogLines.push(msg);
    };

    const { readerName, parserName, writerName } = args;
    const source = new StringInput(`Random test
===========
I like food.

`,
    logger);

    const destination = new StringOutput(logger);
    const pub = new Publisher({
        source, destination, settings, debug: true, debugFn,logger,
    });
    pub.setComponents(readerName, parserName, writerName);
    return new Promise((resolve, reject) => {
        pub.publish({}, (error: Error|{}|undefined) => {
            if (error) {
                reject(error);
                return;
            }
            expect(destination).toBeDefined();
            expect(destination.destination).toBeDefined();
            // @ts-ignore
            expect(JSON.parse(destination.destination)).toMatchSnapshot();
            currentLogLines.length = 0;
            resolve();
        });
    });
});
