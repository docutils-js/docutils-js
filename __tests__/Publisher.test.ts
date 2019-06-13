import Publisher from '../src/Publisher';
import Reader from '../src/Reader';
import Writer from '../src/Writer';
import Output from '../src/io/Output';
import Input from '../src/io/Input';
import newDocument from '../src/newDocument';
import defaults from "../gen/defaults";

const publishingSettings = defaults;

jest.mock('../src/Reader');
jest.mock('../src/Writer');
jest.mock('../src/io/Output');
jest.mock('../src/io/Input');

const input = [];

beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    input.length = 0;

    // @ts-ignore
    Input.mockClear();
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
    // @ts-ignore
    Input.mockImplementation(({ source }) => ({
        getTransforms: () => [],
        read: (cb: any) => {
            cb(undefined, newDocument({sourcePath:''}, publishingSettings));
        },
        decode: (data: any) => data,
    }));

    // @ts-ignore
    Reader.mockClear();
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
    // @ts-ignore
    Reader.mockImplementation((parser, parserName, args) => ({
        getTransforms: () => [],
        /* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
        setParser: (parserName2: any) => {},
        parse: () => {
            parser.parse(/* input,document */);
        },
        newDocument: () => newDocument({sourcePath:''}, publishingSettings),
        /* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
        read: (source: any, parser2: any, settings: any, cb: any) => {
            // call this.source.rad ??
            //        console.log(`in read ${cb}`);
            cb(
                undefined,
                /* expects document */ newDocument({sourcePath:''}, publishingSettings),
            );
        },
    }));
    // @ts-ignore
    Writer.mockClear();
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
    // @ts-ignore
    Writer.mockImplementation(args => ({
        getTransforms: () => [],
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
        write: (document: any, destination: any) => document,
        assembleParts: () => {},
    }));

    // @ts-ignore
    Output.mockClear();
});

test('Instantiate publisher', () => {
    const reader = new Reader({});
    const writer = new Writer();
    // @ts-ignore
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
        settings: defaults,
    });
    publisher.publish({}, (error: any, output: any | any[]) => {
        if (error) {
            throw error;
        }
        expect(output).toMatchSnapshot();
    });
});

test('Instantiate publisher #2', () => {
    const reader = new Reader({});
    const writer = new Writer();
    // @ts-ignore
    const source = new Input({});
    const destination = new Output();
    const publisher = new Publisher({
        source, reader, writer, destination, settings: defaults,
    });
    publisher.publish({}, (error: any, output: any | any[]) => {
        if (error) {
            throw error;{}
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
