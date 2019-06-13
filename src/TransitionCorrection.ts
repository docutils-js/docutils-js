export default class TransitionCorrection extends Error {
    public args: (string|{})[];
    // @ts-ignore
    public constructor(stateName: string, ...args) {
        super();
        this.args = [stateName, args];
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, TransitionCorrection);
        }
    }
}
