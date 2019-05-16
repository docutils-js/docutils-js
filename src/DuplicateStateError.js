class DuplicateStateError extends Error {
    constructor(state, ...params) {
        super(...params);
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, DuplicateStateError);
        }
        this.state = state;
        this.message = `Duplicate state ${state}`;
    }
}

export default DuplicateStateError;
