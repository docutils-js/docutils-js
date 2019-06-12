import {FileInput, StringOutput} from './io';
import { ApplicationError } from './Exceptions';
import OptionParser from './OptParse';
import * as readers from './Readers';
import * as writers from './Writers';
import SettingsSpec from './SettingsSpec';
import Source from './Sources';
/* eslint-disable-next-line no-unused-vars */
import pojoTranslate from './fn/pojoTranslate';
import {Settings} from "../gen/Settings";
import Parser from "./Parser";
import Writer from "./Writer";
import Reader from "./Reader";
import Output from "./io/Output";
import Input from "./io/Input";
import {Document} from "./types";

interface PublisherArgs {
    reader?: Reader;
    parser?: Parser;
    writer?: Writer;
    source?: Input;
    sourceClass?: any;
    destination?: Output<any>;
    destinationClass?: any;
    settings: Settings;
    debugFn?: any;
    debug?: boolean;
}

/**
 * Publisher class.
 */

class Publisher {
    get document(): Document | null | undefined {
        return this._document;
    }
    private settings: Settings;
    private debugFn: any;
    private reader?: Reader;
    private _document: Document | null | undefined;
    private parser?: Parser;
    private writer?: Writer;
    private source?: Input;
    private sourceClass?: any;
    private destination?: Output<any>;
    private destinationClass?: any;
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
    constructor(args: PublisherArgs) {
        const {
            reader, parser, writer, source, sourceClass, destination,
            destinationClass, settings, debugFn,
        } = args;
        /* Terrible defaults ! */
        const sourceClass2 = sourceClass;
        const destinationClass2 = destinationClass;

        this.debugFn = debugFn;
        this._document = null;
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

    setReader(readerName: string, parser?: Parser, parserName?: string) {
        const ReaderClass = readers.getReaderClass(readerName);
        this.reader = new ReaderClass({
            parser, parserName, debug: this.debug, debugFn: this.debugFn,
        });
        this.parser = this.reader!.parser;
    }

    setWriter(writerName: string) {
        const writerClass = writers.getWriterClass(writerName);
        /* not setting document here, the write method takes it, which
         * is confusing */
        this.writer = new writerClass();
    }

    setComponents(readerName: string, parserName: string, writerName: string) {
        if (!this.reader) {
            this.setReader(readerName, this.parser, parserName);
        }
        if (!this.parser) {
            if (!this.reader!.parser) {
                this.reader!.setParser(parserName);
            }
            this.parser = this.reader!.parser;
        }
        if (!this.writer) {
            this.setWriter(writerName);
        }
    }

    setupOptionParser(args: {
        usage: string; description: string; settingsSpec: any; configSection: string; defaults: any;
    }) {
        const { usage, description, settingsSpec, configSection, defaults } = args;
        let settingsSpec2 = settingsSpec;
        if (configSection) {
            if (!settingsSpec2) {
                settingsSpec2 = new SettingsSpec();
            }
            settingsSpec2.configSection = configSection;
            const parts = configSection.split(' ');//fixme check split
            if (parts.length > 1 && parts[parts.length - 1] === 'application') {
                settingsSpec2.configSectionDepenendencies = ['applications'];
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

    processCommandLine(args: {
        argv: string[]; usage: string; description: string; settingsSpec: SettingsSpec; configSection: string;
        settingsOverrides: any;
    }) {
        const optionParser = this.setupOptionParser({
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
        this.settings = optionParser.parseArgs(argv);
    }

    setIO(sourcePath?: string, destinationPath?: string) {
        if (typeof this.source === 'undefined') {
            this.setSource({ sourcePath });
        }
        if (this.destination === undefined) {
            this.setDestination({ destinationPath });
        }
    }

    setSource(args: { source?: any; sourcePath?: string }) {
        let sourcePath = args.sourcePath;
        let source = args.source;
        if (typeof sourcePath === 'undefined') {
            sourcePath = this.settings._source;
        } else {
            this.settings._source = sourcePath;
        }
        try {
            const sourceClass = this.sourceClass;
            this.source = new sourceClass({
                source,
                sourcePath,
                encoding:
                                                this.settings.docutilsCoreOptionParser!.inputEncoding,
            });
        } catch (error) {
            throw new ApplicationError(`Unable to instantiate Source class ${this.sourceClass.constructor.name}: ${error.message}`, { error });
        }
    }

    setDestination(args: { destination?: any; destinationPath?: string }) {
        let destinationPath = args.destinationPath;
        let destination = args.destination;
        if (destinationPath === undefined) {
            destinationPath = this.settings._destination;
        } else {
            this.settings._destination = destinationPath;
        }
        const destinationClass = this.destinationClass;
        this.destination = new destinationClass(
            {
                destination,
                destinationPath,
                encoding: this.settings.docutilsCoreOptionParser!.outputEncoding,
                errorHandler: this.settings.docutilsCoreOptionParser!.outputEncodingErrorHandler,
            },
        );
    }

    applyTransforms() {
        this._document!.transformer.populateFromComponents(
            this.source!, this.reader!, this.reader!.parser,
            this.writer!, this.destination!,
        );
        this._document!.transformer.applyTransforms();
    }

    publish2(args: any) {
        /* eslint-disable-next-line no-unused-vars */
        const {
        /* eslint-disable-next-line no-unused-vars */
            argv, usage, description, settingsSpec, settingsOverrides,
            /* eslint-disable-next-line no-unused-vars */
            configSection, enableExitStatus,
        } = args;
    }

    /* This doesnt seem to return anything ? */
    publish(args: any, cb: any) {

        const {
            /* eslint-disable-next-line no-unused-vars */
            argv, usage, description, settingsSpec, settingsOverrides, configSection, enableExitStatus,
        } = args;
        /* eslint-disable-next-line no-unused-vars */
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
            this.reader.read(
                this.source, this.parser, this.settings,
                ((error: any, document: Document) => {
                    if (error) {
                        cb(error, undefined);
                        return;
                    }
                    this._document = document;
                    if (!document) {
                        throw new Error('need document');
                    }
                    this.applyTransforms();

                    const output = this.writer!.write(this.document!, this.destination);
                    this.writer!.assembleParts();
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
