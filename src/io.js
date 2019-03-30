import { TransformSpec }  from './index';
import { createReadStream } from 'fs';
import ErrorOutput from './ErrorOutput';

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
}

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
	process.stdout.write(data);
    }

    encode(data) {
    }
}

export class FileInput extends Input {
    /* ew, too much logic for a constructor, with side effects and shit! */
    constructor(args) {
	super(args);
	let { source, sourcePath, encoding, errorHandler, autoClose,
	      mode } = args;
	if(source === undefined && sourcePath === undefined) {
	    throw new Error("fail")
	}
	
	if(autoClose === undefined) {
	    autoClose = true;
	}
	if(mode === undefined) {
	    mode = 'r';
	}
	
	this.autoClose = autoClose;
	this._stderr = new ErrorOutput()
	if(!source) {
	    if(sourcePath) {
		try {
		    this.source = createReadStream(sourcePath, { encoding: 'utf8' });
		}
		catch(error) {
		    console.log(error.stack);
		    throw error;
		}
	    } else {
		this.source = process.stdin;
	    }
	} else {
	    
	    // ??
	}
	if(!sourcePath) {
	    this.sourcePath = this.source.name;
	}
    }

    /* Read and decode a single file and return the data (Unicode string).
     */
    read(cb) {
	setTimeout(() => {
	let data;
	try {
	    /* reading ? */
	    if(this.source === process.stdin) {
		// do stuff
	    } else {
		data = this.source.read();
		if(data === null) {
		    console.log("read returned null ?");
		}
		cb(undefined, data);
	    }
	} catch(error) {
	    throw error;
	}
	}, 100);
    }

    readLines() {
	return this.read().splitlines(true);
    }

    close() {
	if(this.source !== process.stdin) {
	    this.source.close();
	}
    }
}

export class FileOutput extends Output {
    
}
