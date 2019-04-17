export class OptionParser {
    _getArgs(args) {
        if (args === undefined) {
            args = process.argv.slice(2);
        }
        return args;
    }

    getDefaultValues() {
        return {};
    }

    _processArgs(largs, rargs, values) {
        while (rargs.length) {
            const arg = rargs[0];
//          console.log(`arg is ${arg}`)
            if (arg === '--') {
                rargs.splice(0);
                return;
            }
            if (arg.substr(0, 2) == '--') {
                this._processLongOpt(rargs, values);
            } else {
                return;
            }
        }
    }

    parseArgs(args, values) {
        /* no idea what is what */
//      console.log(`in base opton parser`);
        const rargs = this._getArgs(args);
//      console.log(`my rargs is ${rargs}`);
        if (values === undefined) {
            values = this.getDefaultValues();
        }
        this.rargs = rargs;
        const largs = this.largs = [];
        this.values = values;

        let stop;
        try {
            stop = this._processArgs(largs, rargs, values);
        } catch (error) {
            console.log(error);
        }

        args = [...largs, ...rargs];
        return this.checkValues(values, args);
    }
}
