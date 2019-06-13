import TransformSpec from '../TransformSpec';
import { ReadCallback } from "../types";

abstract class Input extends TransformSpec {
    public componentType: string = "input";
    public supported: string[] = [];
    private successfulEncoding: string | undefined;
    private defaultSourcePath?: string;
    private encoding?: string;
    private errorHandler?: string;
    protected sourcePath?: string;
    protected source?: {};
    public constructor(
        args: {
            source?: {}; sourcePath?: string; encoding?: string; errorHandler?: string;
        }
    ) {
        super();
        const { source, sourcePath, encoding, errorHandler } = args;
        this.encoding = encoding;
        this.errorHandler = errorHandler;
        this.source = source;
        this.sourcePath = sourcePath;
        if (!sourcePath) {
            this.sourcePath = this.defaultSourcePath;
        }
        this.successfulEncoding = undefined;
    }

    /* istanbul ignore method */
    abstract read(cb: ReadCallback): void;

    /* istanbul ignore method */
    public decode(data: string): string {
        return data;
    }

    /* istanbul ignore method */
    public toString(): string {
        return `Input<${this.constructor.name}>`;
    }
}

export default Input;
