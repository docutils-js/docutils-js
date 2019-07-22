import { NodeInterface, Attributes } from "./types";
import * as nodes from "./nodes";

export default {
    //eslint-disable-next-line @typescript-eslint/camelcase
    math_block: (
        rawsource?: string,
        text?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.math_block => new nodes.math_block(rawsource, text, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    comment: (
        rawsource?: string,
        text?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.comment => new nodes.comment(rawsource, text, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    literal_block: (
        rawsource?: string,
        text?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.literal_block => new nodes.literal_block(rawsource, text, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    raw: (
        rawsource?: string,
        text?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.raw => new nodes.raw(rawsource, text, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    address: (
        rawsource?: string,
        text?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.address => new nodes.address(rawsource, text, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    doctest_block: (
        rawsource?: string,
        text?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.doctest_block => new nodes.doctest_block(rawsource, text, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    paragraph: (
        rawsource?: string,
        text?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.paragraph => new nodes.paragraph(rawsource, text, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    acronym: (
        rawsource?: string,
        text?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.acronym => new nodes.acronym(rawsource, text, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    revision: (
        rawsource?: string,
        text?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.revision => new nodes.revision(rawsource, text, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    target: (
        rawsource?: string,
        text?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.target => new nodes.target(rawsource, text, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    strong: (
        rawsource?: string,
        text?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.strong => new nodes.strong(rawsource, text, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    organization: (
        rawsource?: string,
        text?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.organization => new nodes.organization(rawsource, text, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    term: (
        rawsource?: string,
        text?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.term => new nodes.term(rawsource, text, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    abbreviation: (
        rawsource?: string,
        text?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.abbreviation => new nodes.abbreviation(rawsource, text, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    label: (
        rawsource?: string,
        text?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.label => new nodes.label(rawsource, text, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    footnote_reference: (
        rawsource?: string,
        text?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.footnote_reference => new nodes.footnote_reference(rawsource, text, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    title: (
        rawsource?: string,
        text?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.title => new nodes.title(rawsource, text, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    contact: (
        rawsource?: string,
        text?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.contact => new nodes.contact(rawsource, text, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    substitution_reference: (
        rawsource?: string,
        text?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.substitution_reference => new nodes.substitution_reference(rawsource, text, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    copyright: (
        rawsource?: string,
        text?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.copyright => new nodes.copyright(rawsource, text, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    rubric: (
        rawsource?: string,
        text?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.rubric => new nodes.rubric(rawsource, text, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    citation_reference: (
        rawsource?: string,
        text?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.citation_reference => new nodes.citation_reference(rawsource, text, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    subscript: (
        rawsource?: string,
        text?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.subscript => new nodes.subscript(rawsource, text, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    attribution: (
        rawsource?: string,
        text?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.attribution => new nodes.attribution(rawsource, text, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    classifier: (
        rawsource?: string,
        text?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.classifier => new nodes.classifier(rawsource, text, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    generated: (
        rawsource?: string,
        text?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.generated => new nodes.generated(rawsource, text, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    status: (
        rawsource?: string,
        text?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.status => new nodes.status(rawsource, text, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    reference: (
        rawsource?: string,
        text?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.reference => new nodes.reference(rawsource, text, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    date: (
        rawsource?: string,
        text?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.date => new nodes.date(rawsource, text, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    line: (
        rawsource?: string,
        text?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.line => new nodes.line(rawsource, text, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    option_argument: (
        rawsource?: string,
        text?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.option_argument => new nodes.option_argument(rawsource, text, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    field_name: (
        rawsource?: string,
        text?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.field_name => new nodes.field_name(rawsource, text, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    subtitle: (
        rawsource?: string,
        text?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.subtitle => new nodes.subtitle(rawsource, text, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    emphasis: (
        rawsource?: string,
        text?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.emphasis => new nodes.emphasis(rawsource, text, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    substitution_definition: (
        rawsource?: string,
        text?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.substitution_definition => new nodes.substitution_definition(rawsource, text, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    math: (
        rawsource?: string,
        text?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.math => new nodes.math(rawsource, text, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    problematic: (
        rawsource?: string,
        text?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.problematic => new nodes.problematic(rawsource, text, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    version: (
        rawsource?: string,
        text?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.version => new nodes.version(rawsource, text, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    title_reference: (
        rawsource?: string,
        text?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.title_reference => new nodes.title_reference(rawsource, text, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    author: (
        rawsource?: string,
        text?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.author => new nodes.author(rawsource, text, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    superscript: (
        rawsource?: string,
        text?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.superscript => new nodes.superscript(rawsource, text, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    caption: (
        rawsource?: string,
        text?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.caption => new nodes.caption(rawsource, text, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    option_string: (
        rawsource?: string,
        text?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.option_string => new nodes.option_string(rawsource, text, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    literal: (
        rawsource?: string,
        text?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.literal => new nodes.literal(rawsource, text, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    inline: (
        rawsource?: string,
        text?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.inline => new nodes.inline(rawsource, text, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    list_item: (
        rawsource?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.list_item => new nodes.list_item(rawsource, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    option_list_item: (
        rawsource?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.option_list_item => new nodes.option_list_item(rawsource, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    colspec: (
        rawsource?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.colspec => new nodes.colspec(rawsource, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    option_list: (
        rawsource?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.option_list => new nodes.option_list(rawsource, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    hint: (
        rawsource?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.hint => new nodes.hint(rawsource, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    tip: (
        rawsource?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.tip => new nodes.tip(rawsource, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    table: (
        rawsource?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.table => new nodes.table(rawsource, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    note: (
        rawsource?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.note => new nodes.note(rawsource, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    caution: (
        rawsource?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.caution => new nodes.caution(rawsource, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    admonition: (
        rawsource?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.admonition => new nodes.admonition(rawsource, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    figure: (
        rawsource?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.figure => new nodes.figure(rawsource, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    footnote: (
        rawsource?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.footnote => new nodes.footnote(rawsource, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    topic: (
        rawsource?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.topic => new nodes.topic(rawsource, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    bullet_list: (
        rawsource?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.bullet_list => new nodes.bullet_list(rawsource, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    compound: (
        rawsource?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.compound => new nodes.compound(rawsource, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    footer: (
        rawsource?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.footer => new nodes.footer(rawsource, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    tbody: (
        rawsource?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.tbody => new nodes.tbody(rawsource, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    thead: (
        rawsource?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.thead => new nodes.thead(rawsource, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    field_list: (
        rawsource?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.field_list => new nodes.field_list(rawsource, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    definition_list: (
        rawsource?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.definition_list => new nodes.definition_list(rawsource, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    definition_list_item: (
        rawsource?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.definition_list_item => new nodes.definition_list_item(rawsource, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    decoration: (
        rawsource?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.decoration => new nodes.decoration(rawsource, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    error: (
        rawsource?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.error => new nodes.error(rawsource, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    transition: (
        rawsource?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.transition => new nodes.transition(rawsource, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    image: (
        rawsource?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.image => new nodes.image(rawsource, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    field: (
        rawsource?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.field => new nodes.field(rawsource, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    block_quote: (
        rawsource?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.block_quote => new nodes.block_quote(rawsource, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    sidebar: (
        rawsource?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.sidebar => new nodes.sidebar(rawsource, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    description: (
        rawsource?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.description => new nodes.description(rawsource, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    entry: (
        rawsource?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.entry => new nodes.entry(rawsource, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    section: (
        rawsource?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.section => new nodes.section(rawsource, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    line_block: (
        rawsource?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.line_block => new nodes.line_block(rawsource, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    danger: (
        rawsource?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.danger => new nodes.danger(rawsource, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    header: (
        rawsource?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.header => new nodes.header(rawsource, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    important: (
        rawsource?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.important => new nodes.important(rawsource, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    option: (
        rawsource?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.option => new nodes.option(rawsource, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    warning: (
        rawsource?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.warning => new nodes.warning(rawsource, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    container: (
        rawsource?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.container => new nodes.container(rawsource, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    field_body: (
        rawsource?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.field_body => new nodes.field_body(rawsource, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    legend: (
        rawsource?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.legend => new nodes.legend(rawsource, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    definition: (
        rawsource?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.definition => new nodes.definition(rawsource, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    docinfo: (
        rawsource?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.docinfo => new nodes.docinfo(rawsource, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    enumerated_list: (
        rawsource?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.enumerated_list => new nodes.enumerated_list(rawsource, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    row: (
        rawsource?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.row => new nodes.row(rawsource, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    tgroup: (
        rawsource?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.tgroup => new nodes.tgroup(rawsource, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    option_group: (
        rawsource?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.option_group => new nodes.option_group(rawsource, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    authors: (
        rawsource?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.authors => new nodes.authors(rawsource, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    attention: (
        rawsource?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.attention => new nodes.attention(rawsource, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    citation: (
        rawsource?: string,
        children: NodeInterface[] = [],
        attributes: Attributes = {}
    ): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.citation => new nodes.citation(rawsource, children, attributes),

    //eslint-disable-next-line @typescript-eslint/camelcase
    Text: (data: string, rawsource?: string): //eslint-disable-next-line @typescript-eslint/camelcase
    nodes.Text => new nodes.Text(data, rawsource)
};