import { FileInput, FileOutput } from './io';
import { ApplicationError } from './Exceptions';
import OptionParser from './OptParse';
import * as readers from './Readers';
import * as writers from './Writers';
import SettingsSpec from './SettingsSpec';
import Source from './Sources';
/* eslint-disable-next-line no-unused-vars */
import pojoTranslate from './fn/pojoTranslate';

/**
 * Publisher class.
 */

class Publisher {
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
    constructor(args) {
        const {
 reader, parser, writer, source, sourceClass, destination,
              destinationClass, settings, debugFn,
} = args;
        /* Terrible defaults ! */
        const sourceClass2 = sourceClass || FileInput;
        const destinationClass2 = destinationClass || FileOutput;

        this.debugFn = debugFn;
        this.document = null;
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
            throw new Error();
            // this.destinationClass = Destination;// ?
        } else {
            this.destinationClass = destinationClass2;
        }
        this.settings = settings;
    }

    setReader(readerName, parser, parserName) {
        const ReaderClass = readers.getReaderClass(readerName);
        this.reader = new ReaderClass({
            parser, parserName, debug: this.debug, debugFn: this.debugFn,
        });
        this.parser = this.reader.parser;
    }

    setWriter(writerName) {
        const writerClass = writers.getWriterClass(writerName);
        /* not setting document here, the write method takes it, which
         * is confusing */
        this.writer = new writerClass();
    }

    setComponents(readerName, parserName, writerName) {
        if (!this.reader) {
            this.setReader(readerName, this.parser, parserName);
        }
        if (!this.parser) {
            if (!this.reader.parser) {
                this.reader.setParser(parserName);
            }
            this.parser = this.reader.parser;
        }
        if (!this.writer) {
            this.setWriter(writerName);
        }
    }

    setupOptionParser({
        usage, description, settingsSpec, configSection, defaults,
    }) {
        if (configSection) {
            if (!settingsSpec) {
                settingsSpec = new SettingsSpec();
            }
            settingsSpec.configSection = configSection;
            const parts = configSection.split();
            if (parts.length > 1 && parts[parts.length - 1] === 'application') {
                settingsSpec.configSectionDepenendencies = ['applications'];
            }
        }
        const optionParser = new OptionParser({
            components: [this.parser, this.reader, this.writer, settingsSpec],
            defaults,
            readConfigFiles: true,
            usage,
            description,
        });
        //      console.log(JSON.stringify(optionParser.settingsSpec));
        return optionParser;
    }

    processCommandLine({
        argv, usage, description, settingsSpec, configSection,
        settingsOverrides,
    }) {
        const optionParser = this.setupOptionParser({
            usage,
            description,
            settingsSpec,
            configSection,
            settingsOverrides,
        });
        if (argv === undefined) {
            argv = process.argv.slice(2);
        }
        this.settings = optionParser.parseArgs(argv);
        // bad! fixme
        this.settings.idPrefix = '';
        this.settings.autoIdPrefix = 'auto';
        this.settings.debug = true; // force debug true for now
    }

    setIO(sourcePath, destinationPath) {
        if (typeof this.source === 'undefined') {
            this.setSource({ sourcePath });
        }
        if (this.destination === undefined) {
            this.setDestination({ destinationPath });
        }
    }

    setSource({ source, sourcePath }) {
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
                                                this.settings.inputEncoding,
});
        } catch (error) {
            throw new ApplicationError(`Unable to instantiate Source class ${this.sourceClass.constructor.name}: ${error.message}`, { error });
        }
    }

    setDestination({ destination, destinationPath }) {
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
                encoding: this.settings.outputEncoding,
                errorHandler: this.settings.outputEncodingErrorHandler,
            },
);
    }

    applyTransforms() {
        this.document.transformer.populateFromComponents(
            this.source, this.reader, this.reader.parser,
            this.writer, this.destination,
);
        this.document.transformer.applyTransforms();
    }

    publish2(args) {
        /* eslint-disable-next-line no-unused-vars */
        const {
        /* eslint-disable-next-line no-unused-vars */
            argv, usage, description, settingsSpec, settingsOverrides,
        /* eslint-disable-next-line no-unused-vars */
            configSection, enableExitStatus,
        } = args;
    }

    /* This doesnt seem to return anything ? */
    publish(args, cb) {
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
                ((error, document) => {
                    if (error) {
                        cb(error, undefined);
                        return;
                    }
                    this.document = document;
                    if (!document) {
                        throw new Error('need document');
                    }
                    this.applyTransforms();

                    const output = this.writer.write(this.document, this.destination);
                    this.writer.assembleParts();
                    cb(undefined, output);
                }),
);
        } catch (error) {
            cb(error, undefined);
        }
    }
}

export default Publisher;
