import Component from './Component';
import languages from './languages';

const __version__ = '';

/**
 * Base class for all writers.
 */
export default class Writer extends Component {
    /*
     * @constructor
     *
     */
    constructor(args) {
        super(args);
        this.parts = {};
    }

    write(document, destination) {
        this.document = document;
        this.language = languages.getLanguage(document.settings.languageCode,
                                             document.reporter);
        this.destination = destination;
        this.translate();
//        console.log(this.output);
        let fn;
        if (typeof this.destination.write === 'function') {
            fn = this.destination.write.bind(this.destination);
        } else if (this.destination === 'function') {
            fn = this.destination;
        }

        return fn(this.output);
    }

    translate() {
        throw new Error('subclass must override this method');
    }

    assembleParts() {
        this.parts.whole = this.output;
        this.parts.encoding = this.document.settings.outputEncoding;
        this.parts.version = __version__;
    }
}
