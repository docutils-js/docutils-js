export default class UnexpectedIndentationError extends Error {
    public args: ({}|{}[])[];

    public constructor(...params: {}[]) {
        // @ts-ignore
        super(...params);
        this.args = params;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, UnexpectedIndentationError);
        }
        this.message = `Unexpected indentation error.`;
    }
}
