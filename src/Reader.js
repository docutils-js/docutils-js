import Component from './Component';
import universal from './transforms/universal';
import parsers from './parsers';
import utils from './utils';

export default class Reader extends Component {
    getTransforms() {
	return [];// /*...super.getTransforms()*/ universal.Decorations,
//		 universal.ExportInternals, universal.StripComments ];
    }

    constructor(parser, parserName, args) {
        super(parser, parserName);
        this.componentType = 'reader';
        this.configSection = 'readers';
        this.parser = parser;
        this.debugFn = args.debugFn;
        this.debug = args.debug;
        if (parser === undefined && parserName) {
            this.setParser(parserName);
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
                                 console.log(error.stack);
                                 cb(error);
                                 return;
                             }
                             this.input = data;
                             this.parse();
                             cb(undefined, this.document);
                         });
    }

    /* Delegates to this.parser, providing arguments
       based on instance variables */
    parse() {
        const document = this.newDocument();
        this.document = document;
        if (this.input === undefined) {
            throw new Error(`need input, i have ${this.input}`);
        }

        this.parser.parse(this.input, document);
        document.currentSource = document.currentLine = undefined;
    }

    newDocument() {
        const document = utils.newDocument({ sourcePath: this.source.sourcePath },
                                           this.settings);
        return document;
    }
}
