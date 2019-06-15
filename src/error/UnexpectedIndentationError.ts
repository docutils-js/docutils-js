import StringList from "../StringList";

export default class UnexpectedIndentationError extends Error {
    public block: StringList;

    public constructor(block: StringList) {
        // @ts-ignore
        super();
        this.block = block;

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, UnexpectedIndentationError);
        }
        this.message = `Unexpected indentation error.`;
    }
}
