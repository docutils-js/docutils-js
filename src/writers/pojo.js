import BaseWriter from '../Writer';
import { GenericNodeVisitor } from '../nodes';
import * as docutils from '../index';
import * as nodes from '../nodes';

class POJOTranslator extends GenericNodeVisitor {
    constructor(document) {
        super(document);
        this.ancestors = [];
        this.generator = `<!-- generated by Docutils ${docutils.__version__} -->\n`;
        this.document = document;
        this.warn = this.document.reporter.warning.bind(this.document.reporter);
        this.error = this.document.reporter.error.bind(this.document.reporter);

        const settings = this.settings = document.settings;
        this.level = 0;
        this.inSimple = 0;
        this.fixedText = 0;
        this.output = {};
    }

    default_visit(node) {
        const me = [node.tagname, node.attlist(), []];
        this.ancestors.push(me);
        this.level += 1;
//      console.log(this.level);
    }

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

    visit_Text(node) {
        this.ancestors[this.ancestors.length - 1][2].push(node.astext());
//      const text = escapeXml(node.astext())
//      this.output.push(text);
    }

    depart_Text(node) {
    }
}


export default class Writer extends BaseWriter {
    constructor(args) {
        super(args);
        this.translatorClass = POJOTranslator;
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
    '"Docutils-js POJO" Writer Options',
    null,
    []];
