export default class TransformError extends Error {
    public constructor(message: string) {
        super();
        /* instanbul ignore else */
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, TransformError);
        }
        this.message = message;
    }
}
