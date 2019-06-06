import TransformSpec from '../TransformSpec';

abstract class Input extends TransformSpec {
    private successfulEncoding: any;
    private defaultSourcePath: any;
    private encoding: any;
    private errorHandler: any;
    protected sourcePath: any;
    protected source: any;
    constructor({
 source, sourcePath, encoding, errorHandler,
}) {
        super();
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
    abstract read(cb?: any);

    /* istanbul ignore method */
    decode(data) {
        return data;
    }

    /* istanbul ignore method */
    toString() {
        return `Input<${this.constructor.name}>`;
    }
}

export default Input;
