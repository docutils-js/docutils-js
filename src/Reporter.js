import * as nodes from './nodes';
import { isIterable } from './utils';
import { UnimplementedError as Unimp, SystemMessage } from './Exceptions';

/**
    Return the "source" and "line" attributes from the `node` given or from
    its closest ancestor.
 */
function getSourceLine(node) {
    let myNode = node;
    while (myNode) {
        if (myNode.source || myNode.line) {
            return [myNode.source, myNode.line];
        }
        myNode = myNode.parent;
    }
    return [undefined, undefined];
}

class Reporter {
    constructor(source, reportLevel, haltLevel, stream, debug, encoding,
                errorHandler = 'backslashreplace') {
        if (haltLevel === undefined) {
            haltLevel = 4;
        }
        this.DEBUG_LEVEL = 0;
        this.INFO_LEVEL = 1;
        this.WARNING_LEVEL = 2;
        this.ERROR_LEVEL = 3;
        this.SEVERE_LEVEL = 4;
        this.source = source;
        this.errorHandler = errorHandler;
        this.debugFlag = debug;
        this.reportLevel = reportLevel;
        this.haltLevel = haltLevel;
        // fixme
        this.stream = stream;
        this.encoding = encoding; // fixme
        this.observers = [];
        this.maxLevel = -1;
    }

    setConditions() {
        throw new Unimp();
    }

    /* need better system for arguments!! */
    systemMessage(level, message, children, kwargs) {
        if (typeof children === 'undefined') {
            children = [];
        }
        if (!isIterable(children)) {
            // throw new Error(`Children is not iterable ${children}`);
            kwargs = children;
            children = [];
        }
        if (kwargs === undefined) {
            kwargs = {};
        }

        if (message instanceof Error) {
            message = message.message;
        }

        const attributes = { ...kwargs };
        if ('base_node' in kwargs) {
            const [source, line] = getSourceLine(kwargs.base_node);
            delete attributes.base_node;
            if (source && !attributes.source) {
                attributes.source = source;
            }
            if (line && !attributes.line) {
                attributes.line = line;
            }
        }
        if (!('source' in attributes)) {
            // fixme
        }

        const msg = new nodes.system_message(message, children, attributes);
        if (this.stream) { // fixme
            this.stream.write(`${msg.astext()}\n`);
        }
        if (this.stream && (level >= this.reportLevel
                           || (this.debugFlag && level === this.DEBUG_LEVEL)
                           || level >= this.haltLevel)) {
            this.stream.write(`${msg.astext()}\n`);
        }
        if (level >= this.haltLevel) {
            throw new SystemMessage(msg, level);
        }
        if (level > this.debugLevel || this.debugFlag) {
            this.notifyObservers(msg);
        }
        this.maxLevel = Math.max(level, this.maxLevel);
        return msg;
    }

    notifyObservers(message) {
        this.observers.forEach(o => o(message));
    }

    attachObserver(observer) {
        this.observers.push(observer);
    }

    debug(...args) {
        if (this.debugFlag) {
            return this.systemMessage(this.debugLevel, ...args);
        }
        return undefined;
    }

    info(...args) {
        return this.systemMessage(this.INFO_LEVEL, ...args);
    }

    warning(...args) {
        return this.systemMessage(this.WARNING_LEVEL, ...args);
    }

    error(...args) {
        return this.systemMessage(this.ERROR_LEVEL, ...args);
    }

    severe(...args) {
        return this.systemMessage(this.SEVERE_LEVEL, ...args);
    }
}
export default Reporter;
export { getSourceLine };
