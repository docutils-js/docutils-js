import StringList from "../StringList";

export default class UnexpectedIndentationError extends Error {
    public block: StringList;
    public source: string | undefined;
    public lineno: number | undefined;

    public constructor(block: StringList, source?: string, lineno?: number) {
        // @ts-ignore
        super();
        this.block = block;
        this.source = source;
        this.lineno = lineno;;

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, UnexpectedIndentationError);
        }
        this.message = `Unexpected indentation error.`;
    }
}
