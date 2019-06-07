class UnknownStateError extends Error {
    private state: any;
    constructor(state: any, ...params: any[]) {
        super(...params);
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, UnknownStateError);
        }
        this.state = state;
        this.message = `Unknown state ${state}`;
    }
}

export default UnknownStateError;
