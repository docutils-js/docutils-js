import BaseWriter from '../Writer';
import { GenericNodeVisitor } from '../nodes';

const __version__ = '';
/* eslint-disable-next-line no-unused-vars */
const __docformat__ = 'reStructuredText';

/**
 * Translator class for Pojo writer
 */
class POJOTranslator extends GenericNodeVisitor {
    /**
      * Create a POJOTranslator
      * @param {nodes.document} document - the document to translate
      */
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
        this.output = {};
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
//      const text = escapeXml(node.astext())
//      this.output.push(text);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    depart_Text(node) {
    }
}

/**
 * Writer class for POJOWriter
 */
class POJOWriter extends BaseWriter {
    /**
      * Create POJOWriter
      * @param {Object} args - Arguments, none right now
      */
    constructor(args) {
        super(args);
        this.translatorClass = POJOTranslator;
    }

    /**
     * Translate the document to plain old javascript object
     */
    translate() {
        const TranslatorClass = this.translatorClass;
        const visitor = new TranslatorClass(this.document);
        this.visitor = visitor;
        this.document.walkabout(visitor);
        this.output = visitor.root;
    }
}

POJOWriter.settingsSpec = [
    '"Docutils-js POJO" Writer Options',
    null,
    []];
export default POJOWriter;