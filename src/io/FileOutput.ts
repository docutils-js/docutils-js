import Output from './Output';
import fs from 'fs';

export default class FileOutput extends Output<any> {
    private opened: boolean = false;
    public open(): void {

        this.destination = fs.createWriteStream(this.destinationPath!, { fd: this.destinationPath ? undefined : 1, encoding: this.encoding|| 'utf-8' });
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
