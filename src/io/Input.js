import TransformSpec from '../TransformSpec';

class Input extends TransformSpec {
    constructor({
 source, sourcePath, encoding, errorHandler,
}) {
	super();
	this.encoding = encoding;
	this.errorHandler = errorHandler;
	this.source = source;
	this.sourcePath = sourcePath;
	if (!sourcePath) {
	    this.sourcePath = this.defaultSourcePath;
	}
	this.successfulEncoding = undefined;
    }

    /* istanbul ignore method */
    async read() {
	throw new Error('not implemented');
    }

    /* istanbul ignore method */
    decode(data) {
	return data;
    }

    /* istanbul ignore method */
    toString() {
	return `Input<${this.constructor.name}>`;
    }
}

export default Input;
