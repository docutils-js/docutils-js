import { FileInput, FileOutput } from './io';
import { ApplicationError } from'./Exceptions';
import readers from './Readers'
import writers from './Writers'

class Publisher {
    constructor(args) {
	let { reader, parser, writer, source, sourceClass, destination,
	      destinationClass, settings, debugFn }  = args;
	console.log(source);
	/* Terrible defaults ! */
	if(!sourceClass) {
	    sourceClass = FileInput;
	}
	if(!destinationClass) {
	    destinationClass = FileOutput;
	}
	this.debugFn = debugFn;
	this.document = null;
	this.reader = reader;
	this.parser = parser;
	this.writer = writer;
	this.source = source;
	if(sourceClass === undefined) {
	    this.sourceClass = Source;
	} else {
	    this.sourceClass = sourceClass;
	}

	this.destination = destination;
	if(destinationClass === undefined) {
	    this.destinationClass = Destination;
	}
	else {
	    this.destinationClass = destinationClass;
	}
	this.settings = settings;
    }

    setReader(readerName, parser, parserName) {
	const ReaderClass = readers.getReaderClass(readerName)
	this.reader = new ReaderClass(parser, parserName, { debug: this.debug, debugFn: this.debugFn })
	this.parser = this.reader.parser
    }

    setWriter(writerName) {
	const writerClass = writers.getWriterClass(writerName)
	this.writer = new writerClass();
    }

    setComponents(readerName, parserName, writerName) {
	if(!this.reader) {
	    this.setReader(readerName, this.parser, parserName);
	}
	if(!this.parser) {
	    if(!this.reader.parsser) {
                this.reader.setParser(parserName)
	    }
	    this.parser = this.reader.parser
	}
	if(!this.writer) {
            this.setWriter(writerName)
	}
    }

    setupOptionParser({usage, description, settingsSpec, configSection, defaults}) {
	if(configSection) {
	    if(!settingsSpec) {
		settingsSpec = new SettingsSpec();
	    }
	    settingsSpec.configSection = configSection;
	    const parts = configSection.split();
	    if(parts.length > 1 && parts[parts.length - 1] === 'application') {
		settingsSpec.configSectionDepenendencies = ['applications']

	    }
	}
	const optionParser = new OptionParser({components: [this.parser, this.reader, this.writer, settingsSpec],
					       defaults,
					       readConfigFiles: true,
					       usage,description });
//	console.log(JSON.stringify(optionParser.settingsSpec));
	return optionParser;
    }
    
    processCommandLine({argv, usage, description, settingsSpec, configSection,
			settingsOverrides}) {
	const optionParser = this.setupOptionParser({usage,description,settingsSpec,
					       configSection, settingsOverrides});
	if(argv === undefined) {
	    argv = process.argv.slice(2);
	}
	this.settings = optionParser.parseArgs(argv);
	// bad! fixme
	this.settings.idPrefix = '';
	this.settings.autoIdPrefix = 'auto'
	this.settings.debug = true; // force debug true for now
    }

    setIO(sourcePath, destinationPath) {
	if(typeof this.source === 'undefined') {
	    this.setSource({sourcePath});
	}
	if(this.destination === undefined) {
	    this.setDestination({destinationPath});
	}
    }

    setSource({source, sourcePath}) {
	if(sourcePath === undefined) {
	    sourcePath = this.settings._source;
	}else {
	    this.settings._source = sourcePath;
	}
	try {
	    const sourceClass = this.sourceClass;
	    this.source = new sourceClass({source, sourcePath, encoding:
						this.settings.inputEncoding});
	} catch(error) {
	    throw new ApplicationError(`Unable to instantiate Source class ${this.sourceClass.constructor.name}: ${error.message}`);
	}
    }

    setDestination({ destination, destinationPath}) {
	if(destinationPath === undefined) {
	    destinationPath = this.settings._destination;
	}else{
	    this.settings._destination= destinationPath;
	}
	const destinationClass = this.destinationClass;
	this.destination = new destinationClass({destination,
						  destinationPath,
						  encoding: this.settings.outputEncoding,
						  errorHandler: this.settings.outputEncodingErrorHandler })
    }

    applyTransforms() {
	this.document.transformer.populateFromComponents(this.source, this.reader, this.reader.parser, this.writer, this.destination);
	this.document.transformer.applyTransforms();
    }

    /* This doesnt seem to return anything ? */
    publish(args, cb) {
//	console.log(`publish`)
	const {argv, usage, description, settingsSpec, settingsOverrides, configSection, enableExitStatus } = args;
	let exit = undefined;
	try {
	    if(this.settings === undefined) {
		this.processCommandLine({ argv, usage, description, settingsSpec, configSection, settingsOverrides});
	    }
	    console.log(this.source);
	    this.setIO();

	    //KM
//	    console.log('*** about to call read');
	    /* we may need to change semantics here !! */

	    if(typeof this.reader === 'undefined') {
		throw new ApplicationError('Need defined reader with "read" method');
	    }
	    this.reader.read(
		this.source, this.parser, this.settings,
		((error, document) => {
		    if(error) {
			cb(error, undefined);
			return;
		    }
		    this.document = document;
		    if(!document) {
			throw new Error("need document");
		    }
		    this.applyTransforms()
		    const output =
			  this.writer.write(this.document, this.destination)
		    this.writer.assembleParts();
		    cb(undefined, output);
		}).bind(this));
	} catch(error) {
	    cb(error, undefined);
	}
    }
}

export default Publisher;
