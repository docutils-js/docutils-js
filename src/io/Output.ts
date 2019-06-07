import TransformSpec from '../TransformSpec';

class Output extends TransformSpec {
    protected defaultDestinationPath: any;
    private destinationPath: any;
    private encoding: any;
    protected destination: any;
    private errorHandler: string;
    constructor(destination: any, destinationPath: string, encoding: string, errorHandler: string) {
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
