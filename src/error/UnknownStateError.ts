import { StateInterface } from "../types";

class UnknownStateError extends Error {
    private state: string;
    // @ts-ignore
    public constructor(state: string, info: string) {
        super();
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, UnknownStateError);
        }
        this.state = state;
        this.message = `Unknown state ${state}${info ? `: ${info}` : ''}`;
    }
}

export default UnknownStateError;
