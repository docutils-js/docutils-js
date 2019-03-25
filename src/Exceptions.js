export class UnimplementedException extends Error {
    constructor(message, ...params) {
	super(...params);
	if(Error.captureStackTrace) {
	    Error.captureStackTrace(this, AssertError);
	}
	this.message = message;
    }
}


