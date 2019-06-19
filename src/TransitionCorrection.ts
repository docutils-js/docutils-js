export default class TransitionCorrection extends Error {
    public stateName: string;
    // @ts-ignore
    public constructor(stateName: string) {
        super();
        this.stateName = stateName;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, TransitionCorrection);
        }
    }
}
