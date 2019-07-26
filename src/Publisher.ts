import { ApplicationError, InvalidStateError } from "./Exceptions";
import { ArgumentParser } from 'argparse';
import { OptionParser } from './Frontend';
import * as readers from './Readers';
import * as writers from './Writers';
import SettingsSpec from './SettingsSpec';
/* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
import pojoTranslate from './fn/pojoTranslate';
import {Settings} from "../gen/Settings";
import Parser from "./Parser";
import Writer from "./Writer";
import Reader from "./Reader";
import Output from "./io/Output";
import FileInput from "./io/FileInput";
import FileOutput from "./io/FileOutput";
import Input from "./io/Input";
import { DebugFunction, Document, InputConstructor } from "./types";
import { logger } from './logger';

export interface PublisherArgs {
    reader?: Reader;
    parser?: Parser;
    writer?: Writer;
    source?: Input;
    sourceClass?: InputConstructor;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    destination?: Output<any>;
    destinationClass?: OutputConstructor<any>;
    settings?: Settings;
    debugFn?: DebugFunction;
    debug?: boolean;
}

interface OutputConstructor<T> {
    new (destination?: T, destinationPath?: string, encoding?: string, errorHandler?: string): Output<T>;
}

/*interface InputConstructor {
    new (): Input;
}
*/

/**
 * A facade encapsulating the high-level logic of a Docutils system.
 */

export class Publisher {
    public get document(): Document | undefined {
        return this._document;
    }
    private sourceClass?: InputConstructor;
    private settings?: Settings;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private debugFn: DebugFunction = (msg: string): void => {};
    private reader?: Reader;
    private _document: Document | undefined;
    private parser?: Parser;
    private writer?: Writer;
    private source?: Input;
    //KM1 private sourceClass?: InputConstructor;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private destination?: Output<string>;
    private destinationClass?: OutputConstructor<any>;
    private debug: boolean = false;

    /**
     * Create a publisher instance.
     * @param {Object} args - arguments
     * @param {Reader} args.reader - instance of StandaloneReader
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

    /* reader=None, parser=None, writer=None, source=None,
   source_class=io.FileInput, destination=None,
   destination_class=io.FileOutput, settings=None */

    public constructor(args: PublisherArgs) {
        const {
            reader, parser, writer, source, destination,
            settings, debugFn, sourceClass, destinationClass,
        } = args;

        logger.silly('Publisher.constructor', args);

        if(debugFn !== undefined) {
            this.debugFn = debugFn;
        }
        this._document = undefined;
        this.reader = reader;
        this.parser = parser;
        this.writer = writer;
        this.source = source;
        logger.silly('setting destination to', { destination });
        this.destination = destination;
        // @ts-ignore
        this.sourceClass = sourceClass || FileInput;
        // @ts-ignore
        this.destinationClass = destinationClass || FileOutput;
        this.settings = settings;
    }

    public setReader(readerName: string|undefined, parser?: Parser, parserName?: string): void {
        if(readerName === undefined) {
            return;
        }
        const ReaderClass = readers.getReaderClass(readerName);
        // @ts-ignore
        this.reader = new ReaderClass({
            parser, parserName, debug: this.debug, debugFn: this.debugFn,
        });
        if(this.reader !== undefined) {
            this.parser = this.reader.parser;
        }
    }

    public setWriter(writerName: string|undefined): void {
        if(writerName === undefined) {
            return;
        }
        const writerClass = writers.getWriterClass(writerName);
        /* not setting document here, the write method takes it, which
         * is confusing */
        // @ts-ignore
        this.writer = new writerClass();
    }

    public setComponents(readerName: string|undefined, parserName: string|undefined, writerName: string|undefined): void {
        logger.silly('setComponents', { readerName, parserName, writerName });
        if (!this.reader) {
            this.setReader(readerName, this.parser, parserName);
        }
        if (!this.parser && this.reader !== undefined) {
            if(!this.reader.parser && parserName !== undefined) {
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
            usage: string; description: string; settingsSpec?: SettingsSpec;
            configSection?: string; defaults?: {};
        }
    ): ArgumentParser {
        console.log('setupOptionParser');
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
        settingsSpec2 = settingsSpec2!;
        const optionParser = new OptionParser({components: [this.parser, this.reader,this.writer, settingsSpec2], defaults, readConfigFiles:true, usage,description});
        return optionParser;
    }

    public processCommandLine(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        args: {
            argv: string[]; usage: string; description: string; settingsSpec: SettingsSpec; configSection: string;
            settingsOverrides: {};
        }
    ): void {
        logger.silly('processCommandLine', { args: args.argv });
        try {
            const argParser: ArgumentParser = this.setupOptionParser({
                usage: args.usage,
                description: args.description,
	    });
            let argv = args.argv;
            if (argv === undefined) {
                argv = process.argv.slice(2);
            }
	    logger.silly('calling argParser.parseKnownArgs', { argv });
            const [settings, restArgs] = argParser.parseKnownArgs(argv);
            // @ts-ignore
            this.settings = argParser.checkValues(settings, restArgs);
        } catch(error) {
            console.log(error.stack);
            console.log(error.message);
            throw error;
        }
    }

    public setIO(sourcePath?: string, destinationPath?: string): void {
        logger.silly('setIO', { sourcePath, destinationPath });
        if (this.source === undefined) {
            this.setSource({ sourcePath });
        }
        if (this.destination === undefined) {
            this.setDestination({ destinationPath });
        }
    }

    public setSource(args: { source?: {}; sourcePath?: string }): void {
        logger.silly('setSource');
        let sourcePath = args.sourcePath;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let source = args.source;
        if (typeof sourcePath === 'undefined') {
            sourcePath = this.settings!._source;
        } else {
            this.settings!._source = sourcePath;
        }

        try {
            const SourceClass: InputConstructor = this.sourceClass!;
            let inputEncoding: string | undefined = this.settings!.inputEncoding;

            if(SourceClass !== undefined) {
                this.source = new SourceClass({
                    source,
                    sourcePath,
                    encoding:
                    inputEncoding,
                });
            }
        } catch (error) {
            logger.error(error);
            throw new ApplicationError(`Unable to instantiate Source class ${this.sourceClass!.constructor.name}: ${error.message}`, { error });
        }
    }

    public setDestination(args: { destination?: Output<{}>; destinationPath?: string }): void {
        logger.silly('setDestination', args);
        let destinationPath = args.destinationPath;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let destination = args.destination;
        if (destinationPath === undefined) {
            destinationPath = this.settings!._destination;
        } else {
            this.settings!._destination = destinationPath;
        }
        const DestinationClass = this.destinationClass!;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const outputEncoding = this.settings!.outputEncoding;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let outputEncodingErrorHandler = this.settings!.outputEncodingErrorHandler;
         this.destination = new DestinationClass(
                 destination,
                 destinationPath,
                 outputEncoding,
                 outputEncodingErrorHandler,
         );
    }

    public applyTransforms(): void {
        logger.silly('applyTransforms');
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
    public publish(args: any, cb: (error: Error | undefined | {}, output: undefined | {}) => void): void {
        logger.silly('publish');

        const {
            /* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
            argv, usage, description, settingsSpec, settingsOverrides, configSection, enableExitStatus,
        } = args;
        /* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
        try {
            if (this.settings === undefined) {
                this.processCommandLine({
                    argv, usage, description, settingsSpec, configSection, settingsOverrides,
                });
            }
            this.setIO();

            if (this.reader === undefined) {
                throw new ApplicationError('Need defined reader with "read" method');
            }
            if(this.writer === undefined || this.source === undefined || this.parser === undefined) {
                throw new InvalidStateError('need Writer and source');
            }
            const writer = this.writer;
            if(this.settings! === undefined) {
                throw new InvalidStateError('need serttings');
            }
	    logger.silly('calling reader.read', { reader: this.reader});
            this.reader.read(
                this.source, this.parser, this.settings!,
                ((error: Error | {} | undefined, document: Document|undefined): void => {
                    if (error) {
                        cb(error, undefined);
                        return;
                    }
                    this._document = document;
                    if (document === undefined) {
		    throw new InvalidStateError('need document');
		    }
		    if(this.destination === undefined) {
		    throw new InvalidStateError('need destination');
                    }
                    this.applyTransforms();

                    const output = writer.write(document, this.destination);
                    writer.assembleParts();
		    this.debuggingDumps();
                    // @ts-ignore
                    cb(undefined, output);
                }),
            );
        } catch (error) {
            cb(error, undefined);
        }
    }

    public debuggingDumps() {
        if(this.settings!.dumpSettings) {
            process.stderr.write(JSON.stringify(this.settings!, null, 4));
        }
    }
}