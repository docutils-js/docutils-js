import {StringOutput} from './io';
import { ApplicationError, InvalidStateError } from "./Exceptions";
import OptionParser from './OptParse';
import * as readers from './Readers';
import * as writers from './Writers';
import SettingsSpec from './SettingsSpec';
import Source, { SourceConstructor } from "./Sources";
/* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
import pojoTranslate from './fn/pojoTranslate';
import {Settings} from "../gen/Settings";
import Parser from "./Parser";
import Writer from "./Writer";
import Reader from "./Reader";
import Output from "./io/Output";
import Input from "./io/Input";
import { DebugFunction, Document } from "./types";

interface PublisherArgs {
    reader?: Reader;
    parser?: Parser;
    writer?: Writer;
    source?: Input;
    sourceClass?: Input;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    destination?: Output<any>;
    destinationClass?: {};
    settings: Settings;
    debugFn?: DebugFunction;
    debug?: boolean;
}

interface OutputConstructor<T> {
    new (): Output<T>;
}

/**
 * Publisher class.
 */

class Publisher {
    public get document(): Document | undefined {
        return this._document;
    }
    private settings: Settings;
    private debugFn: DebugFunction;
    private reader?: Reader;
    private _document: Document | undefined;
    private parser?: Parser;
    private writer?: Writer;
    private source?: Input;
    private sourceClass?: SourceConstructor;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private destination?: Output<any>;
    private destinationClass?: OutputConstructor<{}>;
    private debug: boolean = false;

    /**
     * Create a publisher instance.
     * @param {Object} args - arguments
     * @param {Reader} args.reader - instance of Reader
     * @param {Parser} args.parser - instance of Parser
     * @param {Writer} args.writer - instance of Writer
     * @param {Source} args.source - instance of Source
     * @param {function} args.sourceClass - class for source, mutually exclusive with souce paramter
     * @param {Destination} args.destination - where the output should be written
     * @param {function} args.destinationClass - Class for destination, mutually
     *                                           exclusive with destination paramter.
     * @param {object} args.settings - Settings for docutils engine.
     * @param {function} args.debugFn - Debug function.
     */
    public constructor(args: PublisherArgs) {
        const {
            reader, parser, writer, source, sourceClass, destination,
            destinationClass, settings, debugFn,
        } = args;
        /* Terrible defaults ! */
        const sourceClass2 = sourceClass;
        const destinationClass2 = destinationClass;

        if(debugFn !== undefined) {
            this.debugFn = debugFn;
        }
        this._document = undefined;
        this.reader = reader;
        this.parser = parser;
        this.writer = writer;
        this.source = source;
        if (sourceClass2 === undefined) {
            this.sourceClass = Source;
        } else {
            this.sourceClass = sourceClass2;
        }

        this.destination = destination;
        if (destinationClass2 === undefined) {
            this.destinationClass = StringOutput
        } else {
            this.destinationClass = destinationClass2;
        }
        this.settings = settings;
    }

    public setReader(readerName: string, parser?: Parser, parserName?: string): void {
        const ReaderClass = readers.getReaderClass(readerName);
        this.reader = new ReaderClass({
            parser, parserName, debug: this.debug, debugFn: this.debugFn,
        });
        if(this.reader !== undefined) {
            this.parser = this.reader.parser;
        }
    }

    public setWriter(writerName: string): void {
        const writerClass = writers.getWriterClass(writerName);
        /* not setting document here, the write method takes it, which
         * is confusing */
        this.writer = new writerClass();
    }

    public setComponents(readerName: string, parserName: string, writerName: string): void {
        if (!this.reader) {
            this.setReader(readerName, this.parser, parserName);
        }
        if (!this.parser && this.reader !== undefined) {
            if(!this.reader.parser) {
                this.reader.setParser(parserName);
            }
            this.parser = this.reader.parser;
        }
        if (!this.writer) {
            this.setWriter(writerName);
        }
    }

    public setupOptionParser(
        args: {
            usage: string; description: string; settingsSpec: SettingsSpec;
            configSection: string; defaults: {};
        }
    ): OptionParser {
        const { usage, description, settingsSpec, configSection, defaults } = args;
        let settingsSpec2 = settingsSpec;
        if (configSection) {
            if (!settingsSpec2) {
                settingsSpec2 = new SettingsSpec();
            }
            settingsSpec2.configSection = configSection;
            const parts = configSection.split(' ');//fixme check split
            if (parts.length > 1 && parts[parts.length - 1] === 'application') {
                settingsSpec2.configSectionDependencies = ['applications'];
            }
        }
        const optionParser = new OptionParser({
            components: [this.parser, this.reader, this.writer, settingsSpec2],
            defaults,
            readConfigFiles: true,
            usage,
            description,
        });
        //      console.log(JSON.stringify(optionParser.settingsSpec));
        return optionParser;
    }

    public processCommandLine(
        args: {
            argv: string[]; usage: string; description: string; settingsSpec: SettingsSpec; configSection: string;
            settingsOverrides: {};
        }
    ): void {
        const optionParser: OptionParser= this.setupOptionParser({
            usage: args.usage,
            description: args.description,
            settingsSpec: args.settingsSpec,
            configSection: args.configSection,
            defaults: args.settingsOverrides,
        });
        let argv = args.argv;
        if (argv === undefined) {
            argv = process.argv.slice(2);
        }
        const settings = optionParser.parseArgs(argv);
        this.settings = settings;
    }

    public setIO(sourcePath?: string, destinationPath?: string): void {
        if (typeof this.source === 'undefined') {
            this.setSource({ sourcePath });
        }
        if (this.destination === undefined) {
            this.setDestination({ destinationPath });
        }
    }

    public setSource(args: { source?: {}; sourcePath?: string }): void {
        let sourcePath = args.sourcePath;
        let source = args.source;
        if (typeof sourcePath === 'undefined') {
            sourcePath = this.settings._source;
        } else {
            this.settings._source = sourcePath;
        }
        try {
            const SourceClass = this.sourceClass;
            let inputEncoding: string | undefined = this.settings.docutilsCoreOptionParser.inputEncoding;

            if(SourceClass !== undefined) {
                this.source = new SourceClass({
                    source,
                    sourcePath,
                    encoding:
                    inputEncoding,
                });
            }
        } catch (error) {
            throw new ApplicationError(`Unable to instantiate Source class ${this.sourceClass.constructor.name}: ${error.message}`, { error });
        }
    }

    public setDestination(args: { destination?: Output<{}>; destinationPath?: string }): void {
        let destinationPath = args.destinationPath;
        let destination = args.destination;
        if (destinationPath === undefined) {
            destinationPath = this.settings._destination;
        } else {
            this.settings._destination = destinationPath;
        }
        const DestinationClass = this.destinationClass;
        const outputEncoding = this.settings.docutilsCoreOptionParser.outputEncoding;
        let outputEncodingErrorHandler = this.settings.docutilsCoreOptionParser.outputEncodingErrorHandler;
        this.destination = new DestinationClass(
            {
                destination,
                destinationPath,
                encoding: outputEncoding,
                errorHandler: outputEncodingErrorHandler,
            },
        );
    }

    public applyTransforms(): void {
        const document1 = this.document;
        if(document1 === undefined) {
            throw new InvalidStateError('Document undefined');
        }
        if(this.source === undefined ||
        this.reader === undefined ||
        this.reader.parser === undefined
        || this.writer === undefined|| this.destination === undefined) {
            throw new InvalidStateError('Component undefined');
        }
        document1.transformer.populateFromComponents(
            this.source, this.reader, this.reader.parser,
            this.writer, this.destination,
        );
        document1.transformer.applyTransforms();
    }

    /* This doesnt seem to return anything ? */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public publish(args: any, cb: (error: undefined | {}, output: undefined | {}) => void): void {

        const {
            /* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
            argv, usage, description, settingsSpec, settingsOverrides, configSection, enableExitStatus,
        } = args;
        /* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
        let exit;
        try {
            if (this.settings === undefined) {
                this.processCommandLine({
                    argv, usage, description, settingsSpec, configSection, settingsOverrides,
                });
            }
            // console.log(this.source);
            this.setIO();

            // KM
            //          console.log('*** about to call read');
            /* we may need to change semantics here !! */

            if (typeof this.reader === 'undefined') {
                throw new ApplicationError('Need defined reader with "read" method');
            }
            if(this.writer === undefined) {
                throw new InvalidStateError('need Writer');
            }
            const writer = this.writer;
            this.reader.read(
                this.source, this.parser, this.settings,
                ((error: {}, document: Document): void => {
                    if (error) {
                        cb(error, undefined);
                        return;
                    }
                    this._document = document;
                    if (!document) {
                        throw new Error('need document');
                    }
                    this.applyTransforms();

                    const output = writer.write(document, this.destination);
                    writer.assembleParts();
                    cb(undefined, output);
                }),
            );
        } catch (error) {
            cb(error, undefined);
        }
    }
}
export { Publisher };
export default Publisher;
