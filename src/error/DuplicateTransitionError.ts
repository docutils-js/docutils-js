class DuplicateTransitionError extends Error {
    public message: string;
    public transition: string;
    public constructor(transition: string) {
        super();
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, DuplicateTransitionError);
        }
        this.transition = transition;
        this.message = `Duplicate transition ${transition}`;
    }
}

export default DuplicateTransitionError;
