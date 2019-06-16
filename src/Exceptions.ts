import {NodeInterface} from "./types";

export class UnimplementedError extends Error {
    // @ts-ignore
    public constructor(message?: string) {
        super(message);
        /* instanbul ignore else */
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, UnimplementedError);
        }
        this.message = message || '';
    }
}


export class InvalidStateError extends Error {
    // @ts-ignore
    public constructor(message?: string) {
        super(message);
        /* instanbul ignore else */
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, InvalidStateError);
        }
        this.message = message || '';
    }
}

export class EOFError extends Error {
    public constructor() {
        super();
        /* instanbul ignore else */
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, EOFError);
        }
    }
}


export class InvalidArgumentsError extends Error {
    public constructor(message: string) {
        super();
        this.message = message;
        /* instanbul ignore else */
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, InvalidArgumentsError);
        }
    }
}

export const InvalidArgumentError = InvalidArgumentsError;


export class SystemMessage extends Error {
    public msg: NodeInterface;
    public level: number;
    public constructor(msg: NodeInterface, level: number, ...params: []) {
        super(...params);
        this.message = msg.astext();
        this.msg = msg;
        this.level = level;
        /* instanbul ignore else */
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, SystemMessage);
        }
    }
}
interface ErrorArgs {
    error?: Error | undefined;
}

export class ApplicationError extends Error {
    public error: Error | undefined;
    public args: ErrorArgs;
    public constructor(message: string, args: ErrorArgs={}) {
        super(message);
        this.args = args;
        if(args !== undefined) {
            this.error = args.error;
        }
        /* instanbul ignore else */
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ApplicationError);
        }
    }
}

export class DataError extends ApplicationError {
    public constructor(message: string, args?: ErrorArgs) {
        super(message, args);
        /* instanbul ignore else */
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, DataError);
        }
    }
}

export class AssertError extends Error {
    public constructor(message: string) {
        super(message);
        /* instanbul ignore else */
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, AssertError);
        }
        this.message = message;
    }
}
