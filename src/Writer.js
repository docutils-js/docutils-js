import { __version__ } from './index';
import Component from './Component';
import languages from './languages';

export default class Writer extends Component {
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
//	console.log(this.output);
	const output = this.destination.write(this.output);
	return output;
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
