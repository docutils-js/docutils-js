import TransformSpec from '../TransformSpec';
import { ReadCallback, ReadInputCallback, InputArgs } from "../types";

abstract class Input extends TransformSpec {
    public componentType: string = "input";
    public supported: string[] = [];
    private successfulEncoding: string | undefined;
    private defaultSourcePath?: string;
    private encoding?: string;
    private errorHandler?: string;
    public sourcePath?: string;
    protected source?: any;
    public constructor(
        args: InputArgs) {
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
    abstract read(cb: ReadInputCallback<string | string[] | {}>): void;

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
