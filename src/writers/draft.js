import { genKey, ContentBlock, CharacterMetadata } from 'draft-js';
import {
 __version__, Writer as BaseWriter, Transform, nodes,
} from '../index';

const GenericNodeVisitor = nodes.GenericNodeVisitor;

const inlineNodeMap = {
    emphasis: 'ITALIC',
    strong: 'BOLD',
    literal: 'CODE',
    subscript: 'SUBSCRIPT',
    superscript: 'SUPERSCRIPT',
};

const blockMap = {
    title: 'header-one',
    subtitle: 'header-two',
    block_quote: 'blockquote',
    list_item: 'unordered-list-item',
};

class DraftTransform extends Transform {
    apply() {
        console.log('transform draft');
    }
}
DraftTransform.defaultPriority = 950;

class DraftTranslator extends GenericNodeVisitor {
    constructor(document) {
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
    visit_document(node) {
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,no-empty */
    depart_document(node) {
    }

    /* eslint-disable-next-line camelcase */
    default_visit(node) {
        if (node.isInline()) {
            const mappedStyle = inlineNodeMap[node.tagname];
            /* eslint-disable-next-line no-empty */
            if (typeof mappedStyle === 'undefined') {
            } else {
                console.log(`visiting inline style ${mappedStyle}`);
                this.inlineStyles.push(mappedStyle);
            }
        } else {
            let mappedType = blockMap[node.tagname];
            if (typeof mappedType === 'undefined') {
                mappedType = node.tagname.replace(/_/g, '-');
            }
            console.log(`visiting block ${mappedType}`);
        }
        const me = [node.tagname, node.attlist(), []];
        this.ancestors.push(me);
        this.level += 1;
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    default_departure(node) {
        if (node.isInline()) {
            const mappedStyle = inlineNodeMap[node.tagname];
            /* eslint-disable-next-line no-empty */
            if (typeof mappedStyle === 'undefined') {
            } else {
                console.log(`departing inline style ${mappedStyle}`);
                console.log(`creating characterMetadata with ${this.inlineStyles}`);
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
            console.log(`departing block ${mappedType}`);
            this.blocks.push(new ContentBlock({
 key: genKey(), type: mappedType, characterList: this.inline, text: this.text,
}));
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
    visit_Text(node) {
        this.ancestors[this.ancestors.length - 1][2].push(node.astext());
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    depart_Text(node) {
        const text = node.astext();
        console.log(`departing text: ${this.inlineStyles}`);
//        const cmd = CharacterMetadata.create({ style: this.inlineStyles, entity: null });
//        this.inline.push(Array(text.length).fill(cmd));
        console.log(`adding '${text}' to '${this.text}'`);
        this.text += text;
    }
}


export default class Writer extends BaseWriter {
    constructor(args) {
        super(args);
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
        this.document.walkabout(visitor);
        this.output = visitor.blocks;
    }
}

Writer.settingsSpec = [
    '"Docutils-js Draft" Writer Options',
    null,
    []];
