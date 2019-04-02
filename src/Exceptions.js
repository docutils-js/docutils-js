export class UnimplementedError extends Error {
    constructor(message, ...params) {
	super(...params);
	if(Error.captureStackTrace) {
	    Error.captureStackTrace(this, UnimplementedError);
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
    constructor(message, ...params) {
	super(...params);
	this.message = message;
	if(Error.captureStackTrace) {
	    Error.captureStackTrace(this, InvalidArgumentsError);
	}
    }
}
    
export const InvalidArgumentError = InvalidArgumentsError
export class SystemMessage extends Error {
    constructor(msg, level, ...params) {
	super(...params);
	this.message = msg.astext();
	this.msg = msg;
	this.level = level;
	if(Error.captureStackTrace) {
	    Error.captureStackTrace(this, SystemMessage);
	}
    }
}
    
