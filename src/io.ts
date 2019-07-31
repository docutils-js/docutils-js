import Input from './io/Input';
import Output from './io/Output';
import { ReadInputCallback, LoggerType } from "./types";

/** Direct string input. */
export class StringInput extends Input {
    public constructor(source: string, logger: LoggerType, sourcePath?: string, encoding?: string, errorHandler?: string) {
        super({source, sourcePath, encoding, errorHandler, logger});
        this.sourcePath = '<string>';
    }

    public read(cb: ReadInputCallback<string|string[]|{}>): void {
        cb(undefined, this.source);
    }
}

export class StringOutput extends Output<string> {
    public constructor(
        logger: LoggerType,
        destination?: string,
        destinationPath?: string,
        encoding?: string,
        errorHandler?: string
    ) {
        super(logger, destination, destinationPath, encoding, errorHandler);
        this.defaultDestinationPath = '<string>';

    }

    public write(data: string): string {
        // self.destination = self.encode(data) // fixme encoding
        if (Array.isArray(data)) {
            data = JSON.stringify(data);
        }
        this.destination = data;
        return this.destination;
    }
}

