export default class OptionParser {
    private rargs?: string[];
    private largs?: string[];
    private values: any;
    constructor(args: any) {

    }
    _getArgs(args: string[]) {
        if (args === undefined) {
            args = process.argv.slice(2);
        }
        return args;
    }

    getDefaultValues() {
        return {};
    }

    _processArgs(largs: string[], rargs: string[], values: any) {
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

    parseArgs(args: string[], values?: any ): any {
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

        let stop; // eslint-disable-line no-unused-vars
        try {
            stop = this._processArgs(largs, rargs, values);
        } catch (error) {
            // ?
        }

        args = [...largs, ...rargs];
        return this.checkValues(values, args);
    }

    private _processLongOpt(rargs: string[], values: any) {

    }

    private checkValues(values: any, args: any) {

    }
}
