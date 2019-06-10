export default class UnexpectedIndentationError extends Error {
    args: any[];

    constructor(...params: any[]) {
        super(...params);
        this.args = params;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, UnexpectedIndentationError);
        }
        this.message = `Unexpected indentation error.`;
    }
}
