class UnknownStateError extends Error {
    private state: any;
    private args: any[];
    constructor(state: any, ...params: any[]) {
        super(...params);
        this.args = params;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, UnknownStateError);
        }
        this.state = state;
        this.message = `Unknown state ${state}`;
    }
}

export default UnknownStateError;
