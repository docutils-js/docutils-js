class UnknownStateError extends Error {
    constructor(state, ...params) {
	super(...params);
	if(Error.captureStackTrace) {
	    Error.captureStackTrace(this, UnknownStateError);
	}
	this.state = state;
	this.message = `Unknown state ${state}`;
    }
}

export default UnknownStateError;
