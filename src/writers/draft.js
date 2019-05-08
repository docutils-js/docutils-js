import BaseWriter from '../Writer';
import { GenericNodeVisitor } from '../nodes';
import * as docutils from '../index';

class DraftTranslator extends GenericNodeVisitor {
    constructor(document) {
        super(document);
	console.log(document);
        this.ancestors = [];
        this.generator = `<!-- generated by Docutils ${docutils.__version__} -->\n`;
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
    }

    visit_title(node) {
        this.docTitle = node.children;
    }

    depart_title(node) {
    }

    /* eslint-disable-next-line camelcase */
    default_visit(node) {
        const me = [node.tagname, node.attlist(), []];
        this.ancestors.push(me);
        this.level += 1;
//      console.log(this.level);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    default_departure(node) {
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

    /* eslint-disable-next-line camelcase */
    visit_Text(node) {
        this.ancestors[this.ancestors.length - 1][2].push(node.astext());
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    depart_Text(node) {
    }
}


export default class Writer extends BaseWriter {
    constructor(args) {
        super(args);
        this.translatorClass = DraftTranslator;
    }

    translate() {
        const TranslatorClass = this.translatorClass;
        const visitor = new TranslatorClass(this.document);
        this.visitor = visitor;
        this.document.walkabout(visitor);
        this.output = visitor.root;
    }
}

Writer.settingsSpec = [
    '"Docutils-js Draft" Writer Options',
    null,
    []];
