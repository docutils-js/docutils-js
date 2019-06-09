class IndentationError extends Error {
    constructor(message: string, ...params: any[]) {
        super(...params);
        /* instanbul ignore else */
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, IndentationError);
        }
        this.message = message;
    }
}
export default IndentationError;
