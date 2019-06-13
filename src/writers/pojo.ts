import BaseWriter from '../Writer';
import {GenericNodeVisitor, Text} from '../nodes';
import {Document, ElementInterface, NodeInterface} from "../types";
import {Settings} from "../../gen/Settings";
import { InvalidStateError } from "../Exceptions";

const __version__ = '';
/* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
const __docformat__ = 'reStructuredText';

/**
 * Translator class for Pojo writer
 */
class POJOTranslator extends GenericNodeVisitor {
    private level: number;
    private ancestors: {}[][];
    private generator: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private warn: OmitThisParameter<(...args: any[]) => NodeInterface>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private error: OmitThisParameter<(...args: any[]) => NodeInterface>;
    private inSimple: number;
    private output: {};
    private settings: Settings;
    private fixedText: number;
    public root?: NodeInterface;
    /**
      * Create a POJOTranslator
      * @param {nodes.document} document - the document to translate
      */
    public constructor(document: Document) {
        super(document);
        this.ancestors = [];
        this.generator = `<!-- generated by Docutils ${__version__} -->\n`;
        this.document = document;
        if (!this.document.reporter) {
            throw new Error('document has no reporter');
        }
        this.warn = this.document.reporter.warning.bind(this.document.reporter);
        this.error = this.document.reporter.error.bind(this.document.reporter);

        this.settings = document.settings;
        this.level = 0;
        this.inSimple = 0;
        this.fixedText = 0;
        this.output = {};
    }

    /* eslint-disable-next-line @typescript-eslint/camelcase,camelcase */
    public default_visit(node: ElementInterface | NodeInterface): void {
        if ((node as ElementInterface).attlist) {

            const me = [node.tagname, (node as ElementInterface).attlist(), []];
            this.ancestors.push(me);
            this.level += 1;

        }
    }

    /* eslint-disable-next-line @typescript-eslint/camelcase,camelcase,@typescript-eslint/no-unused-vars,no-unused-vars */
    public default_departure(node: NodeInterface): void {
        const me = this.ancestors.pop();
        if (this.level === 1) {
            this.root = me;
            //          console.log(JSON.stringify(me));
        } else {
            const parent = this.ancestors[this.ancestors.length - 1];
            parent[2].push(me);
        }
        this.level -= 1;
    }

    /* eslint-disable-next-line @typescript-eslint/camelcase,camelcase */
    public visit_Text(node: Text): void {
        this.ancestors[this.ancestors.length - 1][2].push(node.astext());
        //      const text = escapeXml(node.astext())
        //      this.output.push(text);
    }

    /* eslint-disable-next-line @typescript-eslint/camelcase,camelcase,@typescript-eslint/no-unused-vars,no-unused-vars */
    public depart_Text(node: Text): void {
    }
}

/**
 * Writer class for POJOWriter
 */
class POJOWriter extends BaseWriter {
    private visitor?: POJOTranslator;
    private translatorClass: typeof POJOTranslator = POJOTranslator;
    /**
      * Create POJOWriter
      * @param {Object} args - Arguments, none right now
      */
    public constructor() {
        super();
    }

    /**
     * Translate the document to plain old javascript object
     */
    public translate(): void {
        const TranslatorClass = this.translatorClass;
        if(this.document === undefined) {
            throw new InvalidStateError('No document');
        }
        const visitor = new TranslatorClass(this.document);
        this.visitor = visitor;
        this.document.walkabout(visitor);

        this.output = visitor.root;
    }
}
/*
POJOWriter.settingsSpec = [
    '"Docutils-js POJO" Writer Options',
    null,
    []];

 */
export default POJOWriter;
