import Component from './Component';
import * as universal from './transforms/universal';
import parsers from './parsers';
import newDocument from './newDocument';

export default class Reader extends Component {
    getTransforms() {
        return [...super.getTransforms(), universal.Decorations]; // fixme
//               universal.ExportInternals, universal.StripComments ];
    }

    constructor(args) {
        super(args);
	const { parser, parseFn, parserName } = args;
        this.componentType = 'reader';
        this.configSection = 'readers';
        this.parser = parser;
	this.parseFn = parseFn;
        this.debugFn = args.debugFn;
        this.debug = args.debug;
        if (parser === undefined) {
	    if(parserName) {
		this.setParser(parserName);
	    }
        }
        this.source = undefined;
        this.input = undefined;
    }

    setParser(parserName) {
        const ParserClass = parsers.getParserClass(parserName).Parser;
        this.parser = new ParserClass({
 debug: this.debug,
                                       debugFn: this.debugFn,
});
    }

    /**
      * Magic read method. Returns document. Clearly this is meant to read
      * the stream in its entirety?
      * why do we have both read and parse??
      * we may have to change api semantics!
      */
    read(source, parser, settings, cb) {
        this.source = source;
        if (!this.parser) {
            this.parser = parser;
        }
        this.settings = settings;
        if (!this.source) {
            throw new Error('Need source');
        }

        this.source.read((error, data) => {
                             if (error) {
                                 cb(error);
                                 return;
                             }
                             this.input = data;
                             this.parse();
                             cb(undefined, this.document);
                         });
    }

    /* read method without callbcks and other junk */
    read2(input, settings) {
	this.input = input;
	this.settings = settings;
	this.parse();
	return this.document;
    }
    
    
    /* Delegates to this.parser, providing arguments
       based on instance variables */
    parse() {
	if(this.parser) {
            const document = this.newDocument();
            this.parser.parse(this.input, document);
            this.document = document;
            if (this.input === undefined) {
		throw new Error(`need input, i have ${this.input}`);
            }
	    
	} else {
	    const document = this.parseFn(this.input);
	    this.document = document;
	}
        this.document.currentSource = undefined;
        this.document.currentLine = undefined;
    }

    newDocument() {
        const document = newDocument({ sourcePath:
				       this.source && this.source.sourcePath },
				     this.settings);
        return document;
    }
}
