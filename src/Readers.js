import Component from './Component';
import parsers from './parsers';
import AssertError from './AssertError';
import utils from './utils';
import universal from './transforms/universal';

export class Reader extends Component {
    getTransforms() {
	return [ /*...super.getTransforms()*/ universal.Decorations,
		 universal.ExportInternals, universal.StripComments ];
    }

    constructor(parser, parserName) {
	super(parser, parserName);
	this.componentType = 'reader';
	this.configSection = 'readers';
	this.parser = parser;
	if(parser === undefined && parserName) {
	    this.setParser(parserName);
	}
	this.source = undefined;
	this.input = undefined;
    }

    setParser(parserName) {
	const ParserClass = parsers.getParserClass(parserName).Parser;
	this.parser = new ParserClass();
    }

    /**
      * Magic read method. Returns document. Clearly this is meant to read
      * the stream in its entirety?
      */
    async read(source, parser, settings) {
	this.source = source;
	if(!this.parser) {
	    this.parser = parser;
	}
	this.settings = settings;
	console.log(this.source.source.readable);
	if(!this.source) {
	    throw new AssertError("Need source");
	}

	console.log("derp");
	let input;
	
	input = await this.source.read();
	this.input = input;
	console.log('my input is ' + this.input);
	await this.parse();
	return this.document;
    }

    async parse() {
	const document = this.newDocument({});
	this.document = document;
	await this.parser.parse(this.input, document);
	document.currentSource = document.currentLine = undefined;
    }

    newDocument() {
	const document = utils.newDocument({ sourcePath: this.source.sourcePath },
					   this.settings);
	return document;
    }
}

class ReReader extends Reader {
    getTransforms() {
	return Component.getTransforms.bind(this)();
    }
}

const _reader_aliases = {}

export function getReaderClass(readerName) {
    return require(`./readers/${readerName}.js`).default;
}

export default {
    getReaderClass,
}
