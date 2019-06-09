import TransformSpec from '../TransformSpec';

abstract class Input extends TransformSpec {
    public componentType: string = "input";
    public supported: string[] = [];
    private successfulEncoding: any;
    private defaultSourcePath: any;
    private encoding: any;
    private errorHandler: any;
    protected sourcePath: any;
    protected source: any;
    constructor(args: {
 source: any, sourcePath: string, encoding: string, errorHandler: string,
}) {
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
    abstract read(cb?: any): void;

    /* istanbul ignore method */
    decode(data: string): string {
        return data;
    }

    /* istanbul ignore method */
    toString() {
        return `Input<${this.constructor.name}>`;
    }
}

export default Input;
