class DuplicateTransitionError extends Error {
   message: string;
   transition: any;
    constructor(transition: any, ...params: any[]) {
        super(...params);
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, DuplicateTransitionError);
        }
        this.transition = transition;
        this.message = `Duplicate transition ${transition}`;
    }
}

export default DuplicateTransitionError;
