import TransformSpec  from '../TransformSpec';

class Input extends TransformSpec {
    constructor({source, sourcePath, encoding, errorHandler}) {
	super();
	this.encoding = encoding;
	this.errorHandler=errorHandler;
	this.source = source;
	this.sourcePath = sourcePath;
	if(!sourcePath) {
	    this.sourcePath = this.defaultSourcePath;
	}
	this.successfulEncoding = undefined;
    }

    async read() {
	throw new Error("not implemented");
    }

    decode(data) {
	return data;
    }

    toString() {
	return `Input<${this.constructor.name}>`;
    }

}

export default Input;
