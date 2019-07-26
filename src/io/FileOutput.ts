import Output from './Output';
import fs from 'fs';

export default class FileOutput extends Output<any> {
    private opened: boolean = false;
    public open(): void {
        if(this.destinationPath === undefined) {
            throw new Error('No stdout support yet.');
        }
        this.destination = fs.createWriteStream(this.destinationPath, { encoding: this.encoding|| 'utf-8' });
    }

    public write(data: string): void {
        if(!this.opened) {
            this.open();
        }
        const d = this.encode(data);
        try {
            this.destination.write(d);
        } catch(error) {
            throw error;
        }
    }
}
