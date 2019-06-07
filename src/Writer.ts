import Component from './Component';
import { getLanguage }from './languages';
import {Document} from "./types";

const __version__ = '';

/**
 * Base class for all writers.
 */
export default class Writer extends Component {
    public parts: any;
    public document?: Document;
    private language: any;
    private destination: any;
    protected output: any | any[];
    /*
     * @constructor
     *
     */
    constructor(args?: any) {
        super();
        this.parts = {};
    }

    write(document: Document, destination: any) {
        this.document = document;
        this.language = getLanguage(document.settings.docutilsCoreOptionParser!.languageCode,
                                             document.reporter);
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

        return fn(this.output);
    }

    translate() {
        throw new Error('subclass must override this method');
    }

    assembleParts() {
        this.parts.whole = this.output;
        this.parts.encoding = this.document!.settings.docutilsCoreOptionParser!.outputEncoding;
        this.parts.version = __version__;
    }
}
