import { createReadStream } from 'fs';
import ErrorOutput from './ErrorOutput';
import Input from './io/Input';
import Output from './io/Output';
import { ApplicationError } from './Exceptions';

export class StringInput extends Input {
    constructor(...args) {
        super(...args);
        this.sourcePath = '<string>';
    }

    read(cb) {
        cb(undefined, this.source);
    }
}

export class StringOutput extends Output {
    constructor(...args) {
        super(...args);
        this.defaultDestinationPath = '<string>';
    }

    write(data) {
        // self.destination = self.encode(data) // fixme encoding
        if (Array.isArray(data)) {
            data = JSON.stringify(data);
        }
        this.destination = data;
        return this.destination;
    }
}

export class FileInput extends Input {
    /* ew, too much logic for a constructor, with side effects etc! */
    constructor(args) {
        super(args);
        const {
        /* eslint-disable-next-line no-unused-vars */
 source, sourcePath, encoding, errorHandler, autoClose,
              mode,
        } = args;
        let myAutoClose = autoClose;
        /* eslint-disable-next-line no-unused-vars */
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
        this._stderr = new ErrorOutput();
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
    read(cb) {
        setTimeout(() => {
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

    readLines() {
        return this.read().splitlines(true);
    }

    close() {
        if (this.source !== process.stdin) {
            this.source.close();
        }
    }
}

export class FileOutput extends Output {

}
