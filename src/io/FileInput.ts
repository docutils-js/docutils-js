import Input from './Input';
import fs from 'fs';
import { ReadInputCallback, InputConstructorArgs, LoggerType } from '../types';

export default class FileInput extends Input {
    public finished: boolean = false;
    public data: string = '';
    public constructor(args: InputConstructorArgs) {
        super(args);
        this.logger.debug(`creating read stream ${args.sourcePath!}`);
        this.source = fs.createReadStream(args.sourcePath!, { fd: args.sourcePath ? undefined : 0, encoding: 'utf-8' });
        this.source.on('data', (chunk: string) => {
            this.data += chunk;
        });
        this.source.on('end', () => {
            this.source.close();
            this.finished = true;
        });
    }

    public read(cb: ReadInputCallback<string | string[] | {}>): void {
        this.logger.silly('read');
        if(this.finished) {
            this.logger.silly('data already read,handing off to callback');

            cb(undefined, this.data);
        } else{
            this.logger.silly('data not read');
            this.source.on('end', () => {
                this.logger.silly('end of source');
                this.finished = true;
                this.source.close();
                this.logger.silly('handing off to cb');
                cb(undefined, this.data);
            });
        }
    }
}
