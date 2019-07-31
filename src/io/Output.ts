import TransformSpec from '../TransformSpec';
import { LoggerType } from '../types';

abstract class Output<T> extends TransformSpec {
    public componentType: string = 'output';
    public supported: string[] = [];
    protected defaultDestinationPath?: string;
    public destinationPath?: string;
    public encoding?: string;
    public destination?: T;
    private errorHandler: string;
    public constructor(logger: LoggerType, destination?: T, destinationPath?: string, encoding?: string, errorHandler?: string) {
        super({logger});
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
    public abstract write(data: string): void;

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
