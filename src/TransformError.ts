export default class TransformError extends Error {
    constructor(message: string, ...params: any[]) {
        super(...params);
        /* instanbul ignore else */
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, TransformError);
        }
        this.message = message;
    }
}
