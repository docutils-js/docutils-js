import * as nodes from './nodes';
import {isIterable} from './utils';
import {SystemMessage, UnimplementedError as Unimp} from './Exceptions';
import {INode, IReporter} from "./types";

/**
    Return the "source" and "line" attributes from the `node` given or from
    its closest ancestor.
 */
function getSourceLine(node: INode) {
    let myNode: INode | undefined = node;
    while (myNode) {
        if (myNode.source || myNode.line) {
            return [myNode.source, myNode.line];
        }
        myNode = myNode.parent;
    }
    return [undefined, undefined];
}

class Reporter implements IReporter {
    private source: string;
    private observers: any[];
    private maxLevel: number;
    private debugLevel: number = 0;
    public  DEBUG_LEVEL: number;
    public  INFO_LEVEL: number;
    public WARNING_LEVEL: number;
    public  ERROR_LEVEL: number;
    private SEVERE_LEVEL: number;
    debugFlag?: boolean;
    reportLevel: number;
    private haltLevel: number;
    private errorHandler: string;
    private stream: any;
    private encoding?: string;
    constructor(source: string, reportLevel: number, haltLevel?: number, stream?: any, debug?: boolean, encoding?: string,
                errorHandler:string = 'backslashreplace') {
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
        throw new Unimp('');
    }

    /* need better system for arguments!! */
    systemMessage(level: number, message: string | Error,
    children?: INode[], kwargs?: any) {
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
        if ('base_node' in kwargs) { //fixme
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

    notifyObservers(message: any) {
        this.observers.forEach(o => o(message));
    }

    // @ts-ignore
    attachObserver(observer) {
        // @ts-ignore
        this.observers.push(observer);
    }

    // @ts-ignore
    debug(...args) {
        if (this.debugFlag) {
            // @ts-ignore
            return this.systemMessage(this.debugLevel, ...args);
        }
        return undefined;
    }

    // @ts-ignore
    info(...args) {
        // @ts-ignore
        return this.systemMessage(this.INFO_LEVEL, ...args);
    }

    // @ts-ignore
    warning(...args) {
        // @ts-ignore
        return this.systemMessage(this.WARNING_LEVEL, ...args);
    }

    // @ts-ignore
    error(...args) {
        // @ts-ignore
        return this.systemMessage(this.ERROR_LEVEL, ...args);
    }

    // @ts-ignore
    severe(...args) {
        // @ts-ignore
        return this.systemMessage(this.SEVERE_LEVEL, ...args);
    }

    getSourceAndLine?: (lineno?: number) => any[];


}
export default Reporter;
export { getSourceLine };
