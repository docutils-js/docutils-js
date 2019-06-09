import TransformSpec from '../TransformSpec';

class Output<T> extends TransformSpec {
    public componentType: string = 'output';
    public supported: string[] = [];
    protected defaultDestinationPath: any;
    private destinationPath: any;
    private encoding: any;
    public destination?: T;
    private errorHandler: string;
    constructor(destination?: T, destinationPath?: any, encoding?: any, errorHandler?: any) {
        super();
        this.encoding = encoding;
        this.errorHandler = errorHandler || 'strict';
        this.destination = destination;
        this.destinationPath = destinationPath;
        if (!destinationPath) {
            this.destinationPath = this.defaultDestinationPath;
        }
    }

    /* istanbul ignore method */
    /* eslint-disable-next-line no-unused-vars */
    write(data: string): void {
    }

    /* istanbul ignore method */
    encode(data: string): string {
        return data; // fixme?
    }

    /* istanbul ignore method */
    toString() {
        return `Output<${this.constructor.name}>`;
    }
}
//Output.componentType = 'Output';
//Output.defaultDestinationPath = null;

export default Output;
