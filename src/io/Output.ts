import TransformSpec from '../TransformSpec';

class Output<T> extends TransformSpec {
    public componentType: string = 'output';
    public supported: string[] = [];
    protected defaultDestinationPath?: string;
    private destinationPath?: string;
    private encoding?: string;
    public destination?: T;
    private errorHandler: string;
    public constructor(destination?: T, destinationPath?: string, encoding?: string, errorHandler?: string) {
        super();
        if(encoding !== undefined) {
            this.encoding = encoding;
        }
        this.errorHandler = errorHandler || 'strict';
        this.destination = destination;
        this.destinationPath = destinationPath;
        if (!destinationPath) {
            this.destinationPath = this.defaultDestinationPath;
        }
    }

    /* istanbul ignore method */
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
    public write(data: string): void {
    }

    /* istanbul ignore method */
    public encode(data: string): string {
        return data; // fixme?
    }

    /* istanbul ignore method */
    public toString() {
        return `Output<${this.constructor.name}>`;
    }
}
//Output.componentType = 'Output';
//Output.defaultDestinationPath = null;

export default Output;
