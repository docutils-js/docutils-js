class OptionParser {
    private rargs?: string[];
    private largs?: string[];
    private values?: {};
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public constructor(args: {}) {
    }
    public _getArgs(args: string[]): string[] {
        if (args === undefined) {
            args = process.argv.slice(2);
        }
        return args;
    }

    public getDefaultValues(): {} {
        return {};
    }

    public _processArgs(largs: string[], rargs: string[], values: {}): void {
        while (rargs.length) {
            const arg = rargs[0];
            //          console.log(`arg is ${arg}`)
            if (arg === '--') {
                rargs.splice(0);
                return;
            }
            if (arg.substr(0, 2) === '--') {
                this._processLongOpt(rargs, values);
            } else {
                return;
            }
        }
    }

    public parseArgs(args: string[], values?: {}): {} {
        /* no idea what is what */
        //      console.log(`in base opton parser`);
        const rargs = this._getArgs(args);
        //      console.log(`my rargs is ${rargs}`);
        if (values === undefined) {
            values = this.getDefaultValues();
        }
        this.rargs = rargs;
        this.largs = [];
        const largs = this.largs;
        this.values = values;

        let stop; // eslint-disable-line @typescript-eslint/no-unused-vars,no-unused-vars
        try {
            stop = this._processArgs(largs, rargs, values);
        } catch (error) {
            // ?
        }

        args = [...largs, ...rargs];
        return this.checkValues(values, args);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public _processLongOpt(rargs: string[], values: {}): void {

    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public checkValues(values: {}, args: string[]): {} {

    }
}

export { OptionParser };