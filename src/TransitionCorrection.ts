export default class TransitionCorrection extends Error {
    public args: any[];
    public constructor(...args: any[]) {
        super(...args);
        this.args = args;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, TransitionCorrection);
        }
    }
}
