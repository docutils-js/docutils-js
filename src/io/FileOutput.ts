import Output from './Output';
import fs from 'fs';

export default class FileOutput extends Output<any> {
    private opened: boolean = false;
    public open(): void {
        this.opened = true;
        if(this.destinationPath !== undefined) {
            this.logger.silly('creating write stream', { value: this.destinationPath });
            this.destination = fs.createWriteStream(this.destinationPath!, { encoding: this.encoding|| 'utf-8' });
        } else {
            this.destination = fs.createWriteStream('/dev/null', { fd: 1, encoding: this.encoding|| 'utf-8' });
        }
        this.destination.write('hello\n');
    }

    public write(data: string): void {
        if(this.destinationPath) {
            fs.writeFileSync(this.destinationPath!, data, { encoding: /*this.encoding || */'utf-8' });
        } else {
            process.stdout.write(data);
        }
        return;
        if(!this.opened) {
            this.open();
        }
        //const d = this.encode(data);
        try {
	    if(this.destination.writable) {
	    this.logger.debug(`writing data to ${this.destinationPath!}`, { value: data });
                this.destination.write(data.toString());
	    } else {
	    this.logger.error('stream unwritable');
	    }
            //	    const contents = fs.readFileSync(this.destinationPath!, { encoding: 'utf-8'});
            //	    this.logger.silly('contents', { value: contents });
        } catch(error) {
	    this.logger.error(`error ${error.message}`);
            throw error;
        }
    }
}
