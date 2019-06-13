export default class StateCorrection extends Error {
    public args: {}[];
    public constructor(...args: {}[]) {
        // @ts-ignore
        super(...args);
        this.args = args;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, StateCorrection);
        }
    }
}
