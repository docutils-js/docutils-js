class DuplicateTransitionError extends Error {
    constructor(transition, ...params) {
        super(...params);
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, DuplicateTransitionError);
        }
        this.transition = transition;
        this.message = `Duplicate transition ${transition}`;
    }
}

export default DuplicateTransitionError;
