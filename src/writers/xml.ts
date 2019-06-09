import BaseWriter from '../Writer';
import * as docutils from '../index';
import * as nodes from '../nodes';
import {Document, INode} from "../types";
import {Settings} from "../../gen/Settings";

export function escapeXml(unsafe: string) {
    if (typeof unsafe === 'undefined') {
        throw new Error('need unsafE');
    }
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return c;
        }
    });
}
class XMLTranslator extends nodes.GenericNodeVisitor {
    private output: any[];
    private indent: string;
    private warn: (...args: any[]) => INode;
    private error: (...args: any[]) => INode;
    private settings: Settings;
    private generator: string;
    private newline: string;
    private level: number;
    private inSimple: number;
    private fixedText: number;
    private simple_nodes: any[] = [];
    private doctype: any;

    constructor(document: Document) {
        super(document);
        this.generator = `<!-- generated by Docutils ${docutils.__version__} -->\n`;
        this.document = document;
        this.warn = this.document.reporter.warning;
        this.error = this.document.reporter.error;

        this.settings = document.settings;

        const settings: Settings = this.settings;
        this.newline = '';
        this.indent = '';
        if (settings.docutilsWritersDocutilsXmlWriter!.newlines) {
            this.newline = '\n';
        }
        if (settings.docutilsWritersDocutilsXmlWriter!.indents) {
            this.newline = 'n';
            this.indent = '    ';
        }
        this.level = 0;
        this.inSimple = 0;
        this.fixedText = 0;
        this.output = [];
        if (settings.docutilsWritersDocutilsXmlWriter!.xmlDeclaration) {
            this.output.push(this.xmlDeclaration(settings.docutilsCoreOptionParser!.outputEncoding));
        }
        if (settings.docutilsWritersDocutilsXmlWriter!.doctypeDeclaration) {
            this.output.push(this.doctype);
        }
        this.output.push(this.generator);
    }

    /* eslint-disable-next-line camelcase */
    default_visit(node: INode) {
        this.simple_nodes = [nodes.TextElement];// nodes.image, nodes.colspec, nodes.transition]
        if (!this.inSimple) {
            this.output.push(Array(this.level + 1).join(this.indent));
        }
        this.output.push(node.starttag());
        this.level += 1;
        // fixme should probably pick this code up
        /* eslint-disable-next-line no-constant-condition */
        if (false) { // node instanceof nodes.FixedTextElement || node instanceof nodes.literal) {
            this.fixedText += 1;
        } else {
            /* eslint-disable-next-line no-restricted-syntax */
            for (const nt of this.simple_nodes) {
                if (node instanceof nt) {
                    this.inSimple += 1;
                    break;
                }
            }
        }
        if (!this.inSimple) {
            this.output.push('\n');
        }
    }

    /* eslint-disable-next-line camelcase */
    default_departure(node: INode) {
        this.level -= 1;
        if (!this.inSimple) {
            this.output.push(Array(this.level + 1).join(this.indent));
        }
        this.output.push(node.endtag());
//      if(node instanceof nodes['FixedTextElement'] || node instanceof nodes.literal) {
//          this.fixedText -= 1;
//      }
        // bla
    }

    /* eslint-disable-next-line camelcase */
    visit_Text(node: INode) {
        const text = escapeXml(node.astext());
        this.output.push(text);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    depart_Text(node: INode) {
    }

    private xmlDeclaration(outputEncoding: string) {

    }
}


export default class Writer extends BaseWriter {
    private visitor: any;
    private translatorClass: any;
    constructor() {
        super();
        this.translatorClass = XMLTranslator;
    }

    translate() {
        const TranslatorClass = this.translatorClass;
        const visitor = new TranslatorClass(this.document);
        this.visitor = visitor;
        this.document!.walkabout(visitor);
        this.output = visitor.output.join('');
        if (process.stderr) {
            // process.stderr.write(this.output);
        }
    }
}
/*
Writer.settingsSpec = [
    '"Docutils XML" Writer Options',
    null,
    [['Generate XML with newlines before and after tags.',
      ['--newlines'],
      { action: 'store_true', validator: 'frontend.validate_boolean' }],
     ['Generate XML with indents and newlines.',
      ['--indents'], // #@ TODO use integer value for number of spaces?
      { action: 'store_true', validator: 'frontend.validate_boolean' }],
     ['Omit the XML declaration.  Use with caution.',
      ['--no-xml-declaration'],
      {
dest: 'xml_declaration',
default: 1,
action: 'store_false',
       validator: 'frontend.validate_boolean',
}],
     ['Omit the DOCTYPE declaration.',
      ['--no-doctype'],
      {
 dest: 'doctype_declaration',
default: 1,
       action: 'store_false',
validator: 'frontend.validate_boolean',
}]]];

 */
