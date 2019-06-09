// @ts-ignore
import { genKey, ContentBlock, CharacterMetadata } from 'draft-js';
import {
 __version__, Writer as BaseWriter, Transform, nodes,
} from '../index';
import {Document, IElement, INode} from "../types";
import {Settings} from "../../gen/Settings";

const GenericNodeVisitor = nodes.GenericNodeVisitor;

const inlineNodeMap: any = {
    emphasis: 'ITALIC',
    strong: 'BOLD',
    literal: 'CODE',
    subscript: 'SUBSCRIPT',
    superscript: 'SUPERSCRIPT',
};

const blockMap: any = {
    title: 'header-one',
    subtitle: 'header-two',
    block_quote: 'blockquote',
    list_item: 'unordered-list-item',
};

class DraftTransform extends Transform {
    apply() {
        /* eslint-disable-next-line no-console */
        console.log('transform draft');
    }
}
DraftTransform.defaultPriority = 950;

class DraftTranslator extends GenericNodeVisitor {
    private text: string;
    private inlineStyles: any[];
    private ancestors: any[];
    private generator: string;
    private warn: OmitThisParameter<(...args: any[]) => INode>;
    private error: OmitThisParameter<(...args: any[]) => INode>;
    private inline: any[];
    private settings: Settings;
    private level: number;
    private blocks: any[];
    private inSimple: number;
    private output: any;
    private fixedText: number;
    private root: any | undefined;
    constructor(document: Document) {
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
        this.output = { blocks: [] };
        this.blocks = [];
        this.inline = [];
        this.inlineStyles = [];
        this.text = '';
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,no-empty */
    visit_document(node: INode) {
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,no-empty */
    depart_document(node: INode) {
    }

    /* eslint-disable-next-line camelcase */
    default_visit(node: INode) {
        if (node.isInline()) {
            const mappedStyle = inlineNodeMap[node.tagname];
            /* eslint-disable-next-line no-empty */
            if (typeof mappedStyle === 'undefined') {
            } else {
        /* eslint-disable-next-line no-console */
                console.log(`visiting inline style ${mappedStyle}`);
                this.inlineStyles.push(mappedStyle);
            }
        } else {
            let mappedType = blockMap[node.tagname];
            if (typeof mappedType === 'undefined') {
                mappedType = node.tagname.replace(/_/g, '-');
            }
        /* eslint-disable-next-line no-console */
            console.log(`visiting block ${mappedType}`);
        }

        const me = [node.tagname, (<IElement>node).attlist(), []];
        this.ancestors.push(me);
        this.level += 1;
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    default_departure(node: INode) {
        if (node.isInline()) {
            const mappedStyle = inlineNodeMap[node.tagname];
            /* eslint-disable-next-line no-empty */
            if (typeof mappedStyle === 'undefined') {
            } else {
        /* eslint-disable-next-line no-console */
                console.log(`departing inline style ${mappedStyle}`);
        /* eslint-disable-next-line no-console */
                console.log(`creating characterMetadata with ${this.inlineStyles}`);
                // @ts-ignore
                const cmd = CharacterMetadata.create({ style: this.inlineStyles, entity: null });
                this.inline.push(...Array(this.text.length).fill(cmd));
                this.text = '';
                this.inlineStyles.pop();
            }
        } else {
            let mappedType = blockMap[node.tagname];
            if (typeof mappedType === 'undefined') {
                mappedType = node.tagname.replace(/_/g, '-');
            }
        /* eslint-disable-next-line no-console */
            console.log(`departing block ${mappedType}`);
            this.blocks.push(new ContentBlock({
 key: genKey(), type: mappedType, characterList: this.inline, text: this.text,
}));
        /* eslint-disable-next-line no-console */
            console.log('setting text to \'\'');
            this.text = '';
            this.inline = [];
            this.inlineStyles = [];
        }
        const me = this.ancestors.pop();
        if (this.level === 1) {
            this.root = me;
        } else {
            const parent = this.ancestors[this.ancestors.length - 1];
            parent[2].push(me);
        }
        this.level -= 1;
    }

    /* eslint-disable-next-line camelcase */
    visit_Text(node: INode) {
        this.ancestors[this.ancestors.length - 1][2].push(node.astext());
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    depart_Text(node: INode) {
        const text = node.astext();
        /* eslint-disable-next-line no-console */
        console.log(`departing text: ${this.inlineStyles}`);
//        const cmd = CharacterMetadata.create({ style: this.inlineStyles, entity: null });
//        this.inline.push(Array(text.length).fill(cmd));
        /* eslint-disable-next-line no-console */
        console.log(`adding '${text}' to '${this.text}'`);
        this.text += text;
    }
}


class Writer extends BaseWriter {
    private visitor: any;
    private translatorClass: any;
    constructor() {
        super();
        this.translatorClass = DraftTranslator;
    }

    getTransforms() {
        const r = super.getTransforms();
        r.push(DraftTransform);
        return r;
    }

    translate() {
        const TranslatorClass = this.translatorClass;
        const visitor = new TranslatorClass(this.document);
        this.visitor = visitor;
        this.document!.walkabout(visitor);
        this.output = visitor.blocks;
    }
}
//
// Writer.settingsSpec = [
//     '"Docutils-js Draft" Writer Options',
//     null,
//     []];

export default Writer;
export { DraftTranslator };
