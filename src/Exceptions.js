export class UnimplementedException extends Error {
    constructor(message, ...params) {
	super(...params);
	if(Error.captureStackTrace) {
	    Error.captureStackTrace(this, UnimplementedException);
	}
	this.message = message;
    }
}


export class EOFError extends Error {
    constructor(...params) {
	super(...params);
	if(Error.captureStackTrace) {
	    Error.captureStackTrace(this, EOFError);
	}
    }
}


export class InvalidArgumentsError extends Error {
    constructor(messag, ...params) {
	super(...params);
	if(Error.captureStackTrace) {
	    Error.captureStackTrace(this, InvalidArgumentsError);
	}
    }
}
    
