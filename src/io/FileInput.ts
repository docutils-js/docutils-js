import Input from './Input';
import fs from 'fs';
import { ReadInputCallback, InputConstructorArgs } from '../types';
export default class FileInput extends Input {
    public finished: boolean = false;
    public data: string = '';
    public constructor(args: InputConstructorArgs) {
        super(args);
        this.source = fs.createReadStream(args.sourcePath!, { fd: args.sourcePath ? undefined : 0, encoding: 'utf-8' });
        this.source.on('data', (chunk: string) => {
            this.data += chunk;
        });
        this.source.on('end', () => {
            this.finished = true;
        });
    }

    public read(cb: ReadInputCallback<string | string[] | {}>): void {
        if(this.finished) {
            cb(undefined, this.data);
        } else{
            this.source.on('end', () => {
                this.finished = true;
                cb(undefined, this.data);
            });
        }
    }
}

