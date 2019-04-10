import TransformSpec  from '../TransformSpec';

class Output extends TransformSpec {
    constructor(destination, destinationPath, encoding, errorHandler) {
	super({});
	this.encoding = encoding;
	this.errorHandler = errorHandler || 'strict'
	this.destination = destination;
	this.destinationPath = destinationPath;
	if(!destinationPath) {
	    this.destinationPath = this.defaultDestinationPath;
	}
    }

    write(data) {
    }

    encode(data) {
    }

    toString() {
	return `Output<${this.constructor.name}>`;
    }

}
Output.componentType = 'Output';
Output.defaultDestinationPath = null;

export default Output;
