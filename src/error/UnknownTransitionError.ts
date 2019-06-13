class UnknownTransitionError extends Error {
    private transition: string
    public constructor(transition: string) {
        super();
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, UnknownTransitionError);
        }
        this.transition = transition;
        this.message = `Unknown transition ${transition}`;
    }
}

export default UnknownTransitionError;
