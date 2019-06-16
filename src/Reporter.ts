import * as nodes from "./nodes";
import { isIterable } from "./utils";
import { SystemMessage, UnimplementedError as Unimp } from "./Exceptions";
import { Attributes, NodeInterface, ObserverCallback, ReporterInterface, Systemmessage, WritableStream } from "./types";

/**
    Return the "source" and "line" attributes from the `node` given or from
    its closest ancestor.
 */
function getSourceLine(node: NodeInterface): [string | undefined, number | undefined] {
    let myNode: NodeInterface | undefined = node;
    while (myNode) {
        if (myNode.source || myNode.line) {
            return [myNode.source, myNode.line];
        }
        myNode = myNode.parent;
    }
    return [undefined, undefined];
}

interface ReporterObserverCallback {
    (msg: Systemmessage): void;
}

class Reporter implements ReporterInterface {
    private source: string;
    private observers: ReporterObserverCallback[];
    private maxLevel: number;
    private debugLevel: number = 0;
    public  DEBUG_LEVEL: number;
    public  INFO_LEVEL: number;
    public WARNING_LEVEL: number;
    public  ERROR_LEVEL: number;
    private SEVERE_LEVEL: number;
    public debugFlag?: boolean;
    public reportLevel: number;
    private haltLevel: number;
    private errorHandler: string;
    private stream?: WritableStream;
    private encoding?: string;
    public constructor(
        source: string,
        reportLevel: number,
        haltLevel?: number,
        stream?: WritableStream,
        debug?: boolean,
        encoding?: string,
        errorHandler: string = 'backslashreplace'
    ) {
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

    public setConditions(): void | never {
        throw new Unimp('');
    }

    /* need better system for arguments!! */
    public systemMessage(level: number, message: string | Error, children?: NodeInterface[], kwargs?: Attributes): NodeInterface {
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

        let myMessage: string;
        if (message instanceof Error) {
            myMessage = message.message;
        } else {
            myMessage = message;
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

        const msg: Systemmessage = new nodes.system_message(myMessage, children, attributes);
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

    public notifyObservers(message: Systemmessage): void {
        this.observers.forEach((o): void => o(message));
    }

    public attachObserver(observer: ReporterObserverCallback): void {
        this.observers.push(observer);
    }

    public debug(message: string | Error, children?: NodeInterface[], kwargs?: Attributes): NodeInterface | undefined {
        if (this.debugFlag) {
            return this.systemMessage(this.debugLevel, message, children, kwargs);
        }
        return undefined;
    }

    public info(message: string | Error, children?: NodeInterface[], kwargs?: Attributes): NodeInterface {
        return this.systemMessage(this.INFO_LEVEL, message, children, kwargs);
    }

    public warning(message: string | Error, children?: NodeInterface[], kwargs?: Attributes): NodeInterface {
        return this.systemMessage(this.WARNING_LEVEL, message, children, kwargs);
    }

    public error(message: string | Error, children?: NodeInterface[], kwargs?: Attributes): NodeInterface {
        return this.systemMessage(this.ERROR_LEVEL, message, children, kwargs);
    }

    public severe(message: string | Error, children?: NodeInterface[], kwargs?: Attributes): NodeInterface {
        return this.systemMessage(this.SEVERE_LEVEL, message, children, kwargs);
    }

    public getSourceAndLine?: (lineno?: number) => [string, number] | undefined;


}
export default Reporter;
export { getSourceLine };
