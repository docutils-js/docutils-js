export default class StateCorrection extends Error {
    public args: any[];
    constructor(...args) {
        super(...args);
        this.args = args;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, StateCorrection);
        }
    }
}
