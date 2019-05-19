import Publisher from '../src/Publisher';
import Reader from '../src/Reader';
import Writer from '../src/Writer';
import Output from '../src/io/Output';
import Input from '../src/io/Input';
import baseSettings from '../src/baseSettings';
import newDocument from '../src/newDocument';

const publishingSettings = baseSettings;

jest.mock('../src/Reader');
jest.mock('../src/Writer');
jest.mock('../src/io/Output');
jest.mock('../src/io/Input');

const input = [];

beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    input.length = 0;

    Input.mockClear();
    /* eslint-disable-next-line no-unused-vars */
    Input.mockImplementation(({ source }) => ({
        getTransforms: () => [],
        read: (cb) => {
            cb(undefined, newDocument({}, publishSettings));
        },
        decode: data => data,
    }));

    Reader.mockClear();
    /* eslint-disable-next-line no-unused-vars */
    Reader.mockImplementation((parser, parserName, args) => ({
        getTransforms: () => [],
        /* eslint-disable-next-line no-unused-vars */
        setParser: (parserName2) => {},
        parse: () => {
            parser.parse(/* input,document */);
        },
        newDocument: () => newDocument({}, publishingSettings),
        /* eslint-disable-next-line no-unused-vars */
        read: (source, parser2, settings, cb) => {
            // call this.source.rad ??
            //        console.log(`in read ${cb}`);
            cb(
                undefined,
                /* expects document */ newDocument({}, publishingSettings),
            );
        },
    }));
    Writer.mockClear();
    /* eslint-disable-next-line no-unused-vars */
    Writer.mockImplementation(args => ({
        getTransforms: () => [],
    /* eslint-disable-next-line no-unused-vars */
        write: (document, destination) => document,
        assembleParts: () => {},
    }));

    Output.mockClear();
});

test('Instantiate publisher', () => {
    const reader = new Reader();
    const writer = new Writer();
    const source = new Input({});
    const destination = new Output();
    //  console.log(Output);
    //  console.log(reader);
    // destination is the correspondence to 'input'
    // which is called 'source'
    //  console.log(source);
    const publisher = new Publisher({
        source,
        reader,
        writer,
        destination,
        settings: baseSettings,
    });
    publisher.publish({}, (error, output) => {
        if (error) {
            throw error;
        }
        expect(output).toMatchSnapshot();
    });
});

test('Instantiate publisher #2', () => {
    const reader = new Reader();
    const writer = new Writer();
    const source = new Input({});
    const destination = new Output();
    const publisher = new Publisher({
        source, reader, writer, destination, settings: baseSettings,
    });
    publisher.publish({}, (error, output) => {
        if (error) {
            throw error;
        }
        expect(output).toMatchSnapshot();
    });
});

/* test('Publisher.publish2', () => {
    const settings = [...baseSettings];
    const source = 'hello';
    const publisher = new Publisher({ settings, source });
});
*/
