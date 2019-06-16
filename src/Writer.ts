import Component from "./Component";
import { getLanguage } from "./languages";
import { Document, WriterParts } from "./types";
import Output from "./io/Output";
import { InvalidStateError } from "./Exceptions";

const __version__ = '';

/**
 * Base class for all writers.
 */
export default abstract class Writer extends Component {
    public parts: WriterParts;
    public document?: Document;
    private language?: {};
    /**
     * Final translated form of `document` (Unicode string for text, binary
     * string for other forms); set by `translate`.
     */
    protected output?: string;
    /**
     * `docutils.io` Output object; where to write the document.
     * Set by `write`.
     */
    private destination?: Output<string>;
    /*
     * @constructor
     *
     */
    public constructor() {
        super();
        this.parts = {};
    }

    public write(document: Document, destination: Output<string>): void {
        this.document = document;
        if(document !== undefined) {
            this.language = getLanguage(document.settings.docutilsCoreOptionParser.languageCode,
                document.reporter);
        }
        this.destination = destination;
        this.translate();
        //        console.log(this.output);
        let fn;
        if (typeof this.destination === 'function') {
            fn = this.destination;
        } else
        if (typeof this.destination.write === 'function') {
            fn = this.destination.write.bind(this.destination);
        }
        if(fn !== undefined && this.output !== undefined) {
            return fn(this.output);
        } else {
            throw new InvalidStateError();
        }
    }

    public abstract translate(): void;

    public assembleParts(): void {
        if(this.document === undefined) {
            throw new InvalidStateError();
        }
        this.parts.whole = this.output;
        this.parts.encoding = this.document.settings.docutilsCoreOptionParser.outputEncoding;
        this.parts.version = __version__;
    }
}
