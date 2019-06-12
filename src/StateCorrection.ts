export default class StateCorrection extends Error {
    public args: any[];
    public constructor(...args: any[]) {
        super(...args);
        this.args = args;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, StateCorrection);
        }
    }
}
