export class UnimplementedError extends Error {
    constructor(message, ...params) {
        super(...params);
        /* instanbul ignore else */
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, UnimplementedError);
        }
        this.message = message;
    }
}


export class EOFError extends Error {
    constructor(...params) {
        super(...params);
        /* instanbul ignore else */
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, EOFError);
        }
    }
}


export class InvalidArgumentsError extends Error {
    constructor(message, ...params) {
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
msg: string;
level: number;
    constructor(msg, level, ...params) {
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
    constructor(...params) {
        super(...params);
        const [message, kwargs] = params; // eslint-disable-line no-unused-vars
        this.error = kwargs ? kwargs.error : undefined;
        /* instanbul ignore else */
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, Error);
        }
    }
}

export class DataError extends ApplicationError {
    constructor(...params) {
        super(...params);
        /* instanbul ignore else */
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, DataError);
        }
    }
}

export class AssertError extends Error {
    constructor(message, ...params) {
        super(...params);
        /* instanbul ignore else */
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, AssertError);
        }
        this.message = message;
    }
}
