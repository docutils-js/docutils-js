export default class StateCorrection extends Error {
    public args: string[];
    public constructor(arg1: string, arg2: string) {
        // @ts-ignore
        super();
        this.args = [ arg1, arg2 ];
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, StateCorrection);
        }
    }
}
