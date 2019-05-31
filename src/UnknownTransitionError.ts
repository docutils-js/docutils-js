class UnknownTransitionError extends Error {
    constructor(transition, ...params) {
        super(...params);
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, UnknownTransitionError);
        }
        this.transition = transition;
        this.message = `Unknown transition ${transition}`;
    }
}

export default UnknownTransitionError;
