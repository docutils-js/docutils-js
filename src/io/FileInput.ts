import Input from './Input';
import fs from 'fs';
import { ReadInputCallback, InputArgs } from '../types';
export default class FileInput extends Input {
constructor(args:InputArgs) {
super(args);
this.source = fs.createReadStream(args.sourcePath!, { encoding: 'utf-8' });
}

    public read(cb: ReadInputCallback<string | string[] | {}>): void {
    
    }
}

