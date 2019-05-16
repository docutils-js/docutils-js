import BaseWriter from '../Writer';
import { GenericNodeVisitor, SkipChildren } from '../nodes';
import { defaultSections } from './rstConfig';

/* eslint-disable-next-line no-console */
console.log = process.stderr.write;

/* eslint-disable-next-line no-unused-vars */
const __version__ = '';
/* eslint-disable-next-line no-unused-vars */
const __docformat__ = 'reStructuredText';

/**
 * Translator class for Pojo writer
 */
class RSTTranslator extends GenericNodeVisitor {
    /**
     * Create a RSTTranslator
     * @param {nodes.document} document - the document to translate
     */
    constructor(document) {
        super(document);
        if (!defaultSections) {
            throw new Error();
        }
        this.ancestors = [];
        this.document = document;
        this.lines = [];
        this.indent = 0;
        this.sectionNum = 0;
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
        this.curLine = '';
    }

    /* eslint-disable-next-line camelcase */
    default_visit(node) {
        if (node.tagname && node.attlist) {
            const me = [node.tagname, node.attlist(), []];
//            console.log(me);
            this.ancestors.push(me);
            this.level += 1;
        } else {
//            console.log(node.astext());
        }

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
        this.default_visit(node);
        this.ancestors[this.ancestors.length - 1][2].push(node.astext());
        this.curLine += node.astext();
        //      const text = escapeXml(node.astext())
        //      this.output.push(text);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    depart_Text(node) {
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_header(node) {
        /* I believe this is typically generated by a transform. */
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_header(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_footer(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_footer(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_decoration(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_decoration(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_document(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_document(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_docinfo(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_docinfo(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_authors(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_authors(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_section(node) {
        this.sectionNum += 1;
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_section(node) {
        this.sectionNum -= 1;
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_topic(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_topic(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_sidebar(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_sidebar(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_transition(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_transition(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_compound(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_compound(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_container(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_container(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_bullet_list(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_bullet_list(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_enumerated_list(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_enumerated_list(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_list_item(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_list_item(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_definition_list(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_definition_list(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_definition_list_item(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_definition_list_item(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_definition(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_definition(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_field_list(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_field_list(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_field(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_field(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_field_body(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_field_body(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_option(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_option(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_option_group(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_option_group(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_option_list(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_option_list(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_option_list_item(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_option_list_item(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_description(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_description(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_line_block(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_line_block(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_block_quote(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_block_quote(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_attention(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_attention(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_caution(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_caution(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_danger(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_danger(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_error(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_error(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_important(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_important(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_note(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_note(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_tip(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_tip(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_hint(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_hint(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_warning(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_warning(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_admonition(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_admonition(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_footnote(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_footnote(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_citation(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_citation(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_figure(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_figure(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_legend(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_legend(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_table(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_table(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_tgroup(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_tgroup(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_colspec(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_colspec(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_thead(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_thead(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_tbody(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_tbody(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_row(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_row(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_entry(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_entry(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_system_message(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_system_message(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_pending(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_pending(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_image(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_image(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_title(node) {
        this.default_visit(node);
        this.newLine();
        const title = node.astext();
//        console.log(this.sectionNum);
        const sectSpec = defaultSections[this.sectionNum - 1];
        let index = 0;
        if (sectSpec.length === 2) {
            this.addLine(sectSpec[index].repeat(title.length));
            index += 1;
        }
        this.addLine(title);
        this.addLine(sectSpec[index].repeat(title.length));
        this.newLine(true);
        throw new SkipChildren();
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_title(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_subtitle(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_subtitle(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_rubric(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_rubric(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_author(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_author(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_organization(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_organization(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_contact(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_contact(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_version(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_version(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_revision(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_revision(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_status(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_status(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_date(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_date(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_copyright(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_copyright(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_paragraph(node) {
        this.default_visit(node);
        this.newLine(true);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_paragraph(node) {
        this.default_departure(node);
        this.newLine(true);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_term(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_term(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_classifier(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_classifier(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_field_name(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_field_name(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_option_argument(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_option_argument(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_option_string(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_option_string(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_line(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_line(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_attribution(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_attribution(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_substitution_definition(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_substitution_definition(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_target(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_target(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_label(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_label(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_caption(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_caption(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_emphasis(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_emphasis(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_strong(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_strong(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_literal(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_literal(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_reference(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_reference(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_footnote_reference(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_footnote_reference(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_citation_reference(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_citation_reference(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_substitution_reference(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_substitution_reference(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_title_reference(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_title_reference(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_abbreviation(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_abbreviation(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_acronym(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_acronym(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_superscript(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_superscript(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_subscript(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_subscript(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_math(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_math(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_inline(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_inline(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_problematic(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_problematic(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_generated(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_generated(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_address(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_address(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_literal_block(node) {
        this.default_visit(node);
        const lastLine = this.getLastLine();
        if (lastLine.endsWith(':')) {
            this.lines[this.lines.length - 1] += ':';
        }
        this.indent += 4;
        if (!this.curLine.trim()) {
            this.curLine = ' '.repeat(this.indent);
        }
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_literal_block(node) {
        this.default_departure(node);
        this.newLine(true);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_doctest_block(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_doctest_block(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_math_block(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_math_block(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_comment(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_comment(node) {
        this.default_departure(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    visit_raw(node) {
        this.default_visit(node);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars,class-methods-use-this */
    depart_raw(node) {
        this.default_departure(node);
    }

    newLine(allowBlankLine) {
        if (this.curLine || allowBlankLine) {
            this.lines.push(this.curLine);
        }
        this.curLine = ' '.repeat(this.indent);
    }

    addLine(line) {
        if (this.curLine) {
            throw new Error();
        }
        this.lines.push(' '.repeat(this.indent) + line);
    }

    getLastLine() {
        return this.lines[this.lines.length - 1];
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
        this.translatorClass = RSTTranslator;
    }

    /**
     * Translate the document to plain old javascript object
     */
    translate() {
        const TranslatorClass = this.translatorClass;
        const visitor = new TranslatorClass(this.document);
        this.visitor = visitor;
        this.document.walkabout(visitor);
        this.output = visitor.lines;
    }
}

POJOWriter.settingsSpec = [
    '"Docutils-js POJO" Writer Options',
    null,
    []];
export default POJOWriter;
