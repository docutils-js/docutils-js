import {INode} from "./types";

export class UnimplementedError extends Error {
    // @ts-ignore
    public constructor(message?: string, ...params) {
        super(...params);
        /* instanbul ignore else */
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, UnimplementedError);
        }
        this.message = message || '';
    }
}


export class EOFError extends Error {
    public constructor(...params: any[]) {
        super(...params);
        /* instanbul ignore else */
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, EOFError);
        }
    }
}


export class InvalidArgumentsError extends Error {
    public constructor(message: any, ...params: any[]) {
        super(...params);
        this.message = message;
        /* instanbul ignore else */
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, InvalidArgumentsError);
        }
    }
}

export const InvalidArgumentError = InvalidArgumentsError;


export class SystemMessage extends Error {
    msg: INode;
    level: number;
    public constructor(msg: INode, level: number, ...params: any[]) {
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

export class ApplicationError extends Error {
    error: Error;
    args: any[];
    public constructor(...params: any[]) {
        super(...params);
        this.args = params;
        const [message, kwargs] = params; // eslint-disable-line no-unused-vars
        this.error = kwargs ? kwargs.error : undefined;
        /* instanbul ignore else */
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, Error);
        }
    }
}

export class DataError extends ApplicationError {
    public constructor(...params: any[]) {
        super(...params);
        /* instanbul ignore else */
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, DataError);
        }
    }
}

export class AssertError extends Error {
    public constructor(message: string, ...params: any[]) {
        super(...params);
        /* instanbul ignore else */
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, AssertError);
        }
        this.message = message;
    }
}
