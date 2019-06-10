import Component from './Component';
import * as universal from './transforms/universal';
import parsers from './parsers';
import newDocument from './newDocument';
import {Document} from "./types";
import {Settings} from "../gen/Settings";

/* eslint-disable-next-line no-unused-vars */
const __docformat__ = 'reStructuredText';

export default class Reader extends Component {
    componentType: string = 'reader';
    document?: Document;
    protected parseFn: any;
    private settings?: Settings;
    protected source: any;
    protected input: any;
    public parser: any;
    private debug: boolean;
    private debugFn: any;
    getTransforms() {
        return [...super.getTransforms(), universal.Decorations]; // fixme
//               universal.ExportInternals, universal.StripComments ];
    }

    constructor(args: { parser?: any, parseFn?: any, parserName?: string, debugFn?: any,
    debug?: boolean }) {
        super();
        const { parser, parseFn, parserName } = args;
        this.componentType = 'reader';
        this.configSection = 'readers';
        this.parser = parser;
        this.parseFn = parseFn;
        this.debugFn = args.debugFn;
        this.debug = args.debug || false;
        if (parser === undefined) {
            if (parserName) {
                this.setParser(parserName);
            }
        }
        this.source = undefined;
        this.input = undefined;
    }

    setParser(parserName: string) {
        const ParserClass = parsers.getParserClass(parserName);
        this.parser = new ParserClass({
 debug: this.debug,
                                       debugFn: this.debugFn,
});
    }

    /**
      * Magic read method::
      *
      *   test123
      *
      */
    read(source: any, parser: any, settings: Settings, cb: any) {
        this.source = source;
        if (!this.parser) {
            this.parser = parser;
        }
        this.settings = settings;
        if (!this.source) {
            throw new Error('Need source');
        }

        this.source.read((error: Error, data: string) => {
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
    read2(input: any, settings: Settings) {
        this.input = input;
        this.settings = settings;
        this.parse();
        return this.document;
    }


    /* Delegates to this.parser, providing arguments
       based on instance variables */
    parse() {
        if (this.parser) {
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
        this.document!.currentSource = '';
        this.document!.currentLine = 0;
    }

    newDocument() {
        const document = newDocument({
 sourcePath:
                                       this.source && this.source.sourcePath,
},
                                     this.settings!);
        return document;
    }
}

export { Reader }
