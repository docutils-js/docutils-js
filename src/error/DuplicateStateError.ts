class DuplicateStateError extends Error {
    public state: string;
    public message: string;
    public constructor(stateName: string) {
        super();
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, DuplicateStateError);
        }
        this.state = stateName;
        this.message = `Duplicate state ${stateName}`;
    }
}

export default DuplicateStateError;
