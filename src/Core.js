import readers from './Readers'
import writers from './Writers'
import {OptionParser} from './FrontEnd'
import {Source} from './Sources';
import { FileInput, FileOutput } from './io';

class Publisher {
    constructor(args) {
	let { reader, parser, writer, source, sourceClass, destination,
		destinationClass, settings }  = args;
	if(!sourceClass) {
	    sourceClass = FileInput;
	}
	if(!destinationClass) {
	    destinationClass = FileOutput;
	}
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
	const readerClass = readers.getReaderClass(readerName)
	this.reader = new readerClass(parser, parserName)
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
	const optionParser = new OptionParser({components: [this.parser, this.reder, this.writer, settingsSpec],
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
    }

    setIO(sourcePath, destinationPath) {
	if(this.source === undefined) {
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
	    console.log(error.stack);
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
    
    async publish(args) {
	const {argv, usage, description, settingsSpec, settingsOverrides, configSection, enableExitStatus } = args;
	let exit = undefined;
	try {
	    if(this.settings === undefined) {
		console.log('processing command line');
		this.processCommandLine({ argv, usage, description, settingsSpec, configSection, settingsOverrides});
	    }
	    this.setIO();

	    //KM
	    console.log('about to call read');
	    this.document = await this.reader.read(this.source,
						   this.parser,
						   this.settings)
	    if(!this.document) {
		throw new Error("need document");
	    }
	    this.applyTransforms()
	    const output = this.writer.write(this.document, this.destination)
	    this.writer.assembleParts();
	} catch(error) {
	    console.log(error.stack);
	}
					  
    }
}

export const defaultUsage = '%prog [options] [<source> [<destination>]]'
export const defaultDescription = ('Reads from <source> (default is stdin) and writes to <destination> (default is stdout).  See <http://docutils.sf.net/docs/user/config.html> for the full reference.')


export async function publishCmdLine(args) {
    const _defaults = { readerName: 'standalone',
			parserName: 'restructuredtext',
			usage: defaultUsage,
			description: defaultDescription,
			enableExitStatu: true };
    args = { ..._defaults, ...args }
    const { reader, readerName, parser, parserName, writer, writerName,
      settings, settingsSpec, settingsOverrides, configSection,
	    enableExitStatus, argv, usage, description } = args;
    console.log(`argv is ${argv}`);
    const pub = new Publisher({reader, parser, writer, settings});
    pub.setComponents(readerName, parserName, writerName);
    return pub.publish({argv, usage, description, settingsSpec, settingsOverrides, configSection, enableExitStatus });
}
