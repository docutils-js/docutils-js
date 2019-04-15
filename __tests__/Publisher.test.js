import Publisher from "../src/Publisher";
import Reader from "../src/Reader";
import Writer from "../src/Writer";
import Output from "../src/io/Output";
import Input from "../src/io/Input";
import baseSettings from "../src/baseSettings";
import { ApplicationError } from "../src/Exceptions";
import { newDocument } from "../src/utils";

const publishingSettings = baseSettings;

jest.mock("../src/Reader");
jest.mock("../src/Writer");
jest.mock("../src/io/Output");
jest.mock("../src/io/Input");

const input = [];

beforeEach(() => {
  // Clear all instances and calls to constructor and all methods:
  input.length = 0;

  Input.mockClear();
  Input.mockImplementation(({ source }) => {
    return {
      getTransforms: () => [],
      read: cb => {
        cb(undef, newDocument({}, publishSettings));
      },
      decode: data => data
    };
  });

  Reader.mockClear();
  Reader.mockImplementation((parser, parserName, args) => {
    return {
      getTransforms: () => [],
      setParser: parserName => {},
      parse: () => {
        parser.parse(/*input,document*/);
      },
      newDocument: () => newDocument({}, publishingSettings),
      read: (source, parser, settings, cb) => {
        // call this.source.rad ??
//        console.log(`in read ${cb}`);
        cb(
          undefined,
          /* expects document */ newDocument({}, publishingSettings)
        );
      }
    };
  });
  Writer.mockClear();
  Writer.mockImplementation(args => {
    return {
      getTransforms: () => [],
      write: (document, destination) => {
//        console.log(`in write ${document}`);
        return document;
      },
      assembleParts: () => {}
    };
  });

  Output.mockClear();
});

test("Instantiate publisher", () => {
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
    settings: baseSettings
  });
  publisher.publish({}, (error, output) => {
      if (error) {
	  throw error;
      }
      const write = destination.write;
      expect(output.toString()).toMatchSnapshot();
  });
});

test("Instantiate publisher #2", () => {
  const reader = new Reader();
  const writer = new Writer();
  const source = new Input({});
  const destination = new Output();
  const publisher = new Publisher({ source, reader, writer, destination, settings: baseSettings });
  publisher.publish({}, (error, output) => {
      if (error) {
	  throw error;
      }
      const write = destination.write;
      expect(output.toString()).toMatchSnapshot();
  });
});
