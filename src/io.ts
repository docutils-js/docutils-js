import { createReadStream } from 'fs';
import Input from './io/Input';
import Output from './io/Output';
import { ApplicationError } from './Exceptions';
import { ReadCallback } from "./types";

/** Direct string input. */
export class StringInput extends Input {

    public constructor(source: string, sourcePath?: string, encoding?: string, errorHandler?: string) {
        super({source, sourcePath, encoding, errorHandler});
        this.sourcePath = '<string>';
    }

    public read(cb: ReadCallback): void {
        cb(undefined, this.source);
    }
}

export class StringOutput extends Output<string> {
    public constructor(
        destination?: string,
        destinationPath?: string,
        encoding?: string,
        errorHandler?: string
    ) {
        super(destination, destinationPath, encoding, errorHandler);
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

export class FileInput extends Input {

    private autoClose: boolean;
    /* ew, too much logic for a constructor, with side effects etc! */
    public constructor(args: {
        mode?: {};
        autoClose?: boolean;
        source?: {};
        sourcePath?: string;
        encoding?: string;
        errorHandler?: string;
    }) {
        super(args);
        const {
        /* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
            source, sourcePath, encoding, errorHandler, autoClose,
            mode,
        } = args;
        let myAutoClose = autoClose;
        /* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
        let myMode = mode;
        if (typeof source === 'undefined' && typeof sourcePath === 'undefined') {
            throw new ApplicationError('FileInput: Undefined source and sourcePath');
        }

        if (typeof myAutoClose === 'undefined') {
            myAutoClose = true;
        }
        if (typeof mode === 'undefined') {
            myMode = 'r';
        }

        this.autoClose = myAutoClose;
        if (!source) {
            if (sourcePath) {
                try {
                    this.source = createReadStream(sourcePath, { encoding: 'utf8' });
                } catch (error) {
                    throw error;
                }
            } else {
                this.source = process.stdin;
            }
        } else {

            // ??
        }
        if (!sourcePath) {
            this.sourcePath = this.source.name;
        }
    }

    /* Read and decode a single file and return the data (Unicode string).
     */
    public read(cb: ReadCallback): void {
        setTimeout((): void => {
            let data;
            try {
            /* reading ? */
                if (this.source === process.stdin) {
                // do stuff
                } else {
                    data = this.source.read();
                    //                if (data === null) {
                    //                    console.log('read returned null ?');
                    //                }
                    cb(undefined, data);
                }
            } catch (error) {
                //            console.log(error.stack);
                cb(error, undefined);
            }
        }, 100);
    }

    // readLines() {
    //     return this.read().splitlines(true);
    // }

    public close(): void {
        if (this.source !== process.stdin) {
            this.source.close();
        }
    }
}

