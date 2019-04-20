import BaseWriter from '../Writer';
import * as docutils from '../index';
import * as nodes from '../nodes';
import * as utils from '../utils';
import { getLanguage } from '../languages';
import * as ejs from 'ejs';

const defaultTemplate = `<%- head_prefix %>
<%- head %>
<%- stylesheet %>
<%- bodyPrefix %>
<%- bodyPreDocinfo %>
<%- docinfo %>
<%- body %>
<%- bodySuffix %>
`;

const template = ejs.compile(defaultTemplate, {});


export default class Writer extends BaseWriter {
    constructor(args) {
        super(args);
        this.attr = {};
        this.translatorClass = HTMLTranslator;
    }

    _init(args) {
	super._init(args);
	this.defaultTemplateContent = defaultTemplate;
	this.template = template;
	this.visitorAttributes = [
        'headPrefix', 'head', 'stylesheet', 'bodyPrefix',
        'bodyPreDocinfo', 'docinfo', 'body', 'bodySuffix',
        'title', 'subtitle', 'header', 'footer', 'meta', 'fragment',
        'htmlProlog', 'htmlHead', 'htmlTitle', 'htmlSubtitle',
            'htmlBody'];
    }
	

    translate() {
        this.visitor = new this.translatorClass(this.document);
        const visitor = this.visitor;
	if(!visitor) {
	    throw new Error();
	}
        this.document.walkabout(visitor);
        this.visitorAttributes.forEach((attr) => {
            this[attr] = visitor[attr];
	});
        this.output = visitor.body.join('');// this.applyTemplate();
        console.log(this.output);
    }

    applyTemplate() {
        const templateContent = this.defaultTemplateContent; // = this.document.settings.templateContent;
        /*        template_file = open(this.document.settings.template, 'rb')
        template = unicode(template_file.read(), 'utf-8')
        template_file.close()
        subs = this.interpolation_dict()
        return template % subs
	*/
	return template(this.templateVars());
    }

    templateVars() {
	const vars = {};
        const settings = this.document.settings
	this.visitorAttributes.forEach((attr) => vars[attr] = (this[attr] || []).join('').trim());
        vars['encoding'] = settings.output_encoding
        vars['version'] = docutils.__version__
	return vars;
    }
    assembleParts() {
	super.assembleParts();
	this.visitorAttributes.forEach((part) => this.parts[part] = (this[part] || []).join(''));
    }
}

class HTMLTranslator extends nodes.NodeVisitor {
    constructor(document) {
        super(document);
        this.settings = document.settings;
        const settings = this.settings;
        const langCode = settings.languageCode;
        this.language = getLanguage(langCode, document.reporter);
        this.meta = '';// fixme: this.meta = [this.generator % docutils.__version__]
        this.headPrefix = [];
        this.htmlProlog = [];
        if (settings.xmlDeclaration) {
/*            this.head_prefix.append(this.xml_declaration
                                    % settings.output_encoding)
            # this.content_type = ""
            # encoding not interpolated:
            this.html_prolog.append(this.xml_declaration)
*/
        }
        this.head = this.meta.slice();
// fixme        this.stylesheet = utils.getStylesheetList(settings).map(this.stylesheetCall.bind(this));
        this.bodyPrefix = ['</head>\n<body>\n'];
        this.bodyPreDocinfo = [];
        this.docinfo = [];
        this.body = [];
        this.fragment = [];
        this.bodySuffix = ['</body>\n</html\n'];
        this.sectionLevel = 0;
        this.initialHeaderLevel = parseInt(settings.initialHeaderLevel, 10);
        this.mathOutput = utils.pySplit(settings.mathOutput || '');
        this.mathOutputOptions = this.mathOutput.slice(1, this.mathOutput.length - 1);
        this.mathOutput = this.mathOutput[0].toLowerCase();
        this.context = [];

        this.topicClasses = [];
        this.colSpecs = [];
        this.compactParagraph = true;
        this.compactSimple = false;
        this.compactFieldList = false;
        this.inDocinfo = false;
        this.inSidebar = false;
        this.inFootnoteList = false;
        this.title = [];
        this.subtitle = [];
        this.header = [];
        this.footer = [];
        this.htmlHead = [this.contentType];
        this.htmlTitle = [];
        this.htmlSubtitle = [];
        this.htmlBody = [];
        this.inmDocumentTitle = 0;
        this.inMailto = false;
        this.authorInAuthors = false;
        this.mathHeader = [];
    }

    attVal(text, whitespace=/[\n\r\t\v\f]/g) {
	console.log(whitespace);
	//"""Cleanse, HTML encode, and return attribute value text."""
	let encoded = this.encode(text.replace(whitespace, ' '));
	if(this.inMailto && this.settings.cloakEmailAddresses) {
	    // Cloak at-signs ("%40") and periods with HTML entities.
            encoded = encoded.replace('%40', '&#37;&#52;&#48;');
	    encoded = encoded.replace('.', '&#46;')
	}
	return encoded;
    }

    starttag(node, tagname, suffix = '\n', empty = false, attributes = {}) {
        /* """
        Construct and return a start tag given a node (id & class attributes
        are extracted), tag name, and optional attributes.
        """ */
        const myTagname = tagname.toLowerCase();
        const prefix = [];
        const atts = {};
        const ids = [];
        Object.entries(attributes).forEach(([name, value]) => atts[name.toLowerCase()] = value);
        const classes = [];
        const languages = [];
        // unify class arguments and move language specification
        const c = node.attributes.classes || [];
	console.log(c);
	console.log(atts.class);
        c.splice(c.length - 1, 0, ...utils.pySplit(atts.class || ''));
	console.log(c);
        c.forEach((cls) => {
            if (cls.substring(0, 8) === 'language-') {
                languages.splice(0, 0, cls.substring(9));
            } else if (cls.trim() && classes.indexOf(cls) === -1) {
                classes.push(cls);
            }
        });
        if (languages.length) {
            // attribute name is 'lang' in XHTML 1.0 but 'xml:lang' in 1.1
            atts[this.langAttribute] = languages[0];
        }
        if (classes.length) {
            atts.class = classes.join(' ');
        }
//        assert 'id' not in atts
        ids.push(...(node.attributes.ids || []));
  /*      if 'ids' in atts:
            ids.extend(atts['ids'])
            del atts['ids']
        if ids:
            atts['id'] = ids[0]
            for id in ids[1:]:
                // Add empty "span" elements for additional IDs.  Note
                // that we cannot use empty "a" elements because there
                // may be targets inside of references, but nested "a"
                // elements aren't allowed in XHTML (even if they do
                // not all have a "href" attribute).
                if empty or isinstance(node,
                            (nodes.bullet_list, nodes.docinfo,
                             nodes.definition_list, nodes.enumerated_list,
                             nodes.field_list, nodes.option_list,
                             nodes.table)):
                    // Insert target right in front of element.
                    prefix.push('<span id="%s"></span>' % id)
                else:
                    // Non-empty tag.  Place the auxiliary <span> tag
                    // *inside* the element, as the first child.
                    suffix += '<span id="%s"></span>' % id

*/
        const attlist = { ...atts };
        //attlist.sort()
        const parts = [myTagname];
	Object.entries(attlist).forEach(( [ name, value ] ) => {
            // value=None was used for boolean attributes without
            // value, but this isn't supported by XHTML.
//            assert value is not None
	    if(Array.isArray(value)) {
                parts.push(`${name.toLowerCase()}="${this.attVal(value.join(' '))}"`);
	    } else {
                parts.push(`${name.toLowerCase()}="${this.attVal(value)}"`);
	    }
	});
	const infix = empty ? ' /' : '';
        // return ''.join(prefix) + '<%s%s>' % (' '.join(parts), infix) + suffix
        return `${prefix.join('')}<${parts.join(' ')}${infix}>${suffix}`;
    }

    encode(text) {
        return text; // fixme
    }

    visit_section(node) {
        this.sectionLevel += 1;
        this.body.push(
            this.starttag(node, 'div', '\n', false, { CLASS: 'section' }),
);
    }

    depart_section(node) {
        this.sectionLevel -= 1;
        this.body.push('</div>\n');
    }

    visit_Text(node) {
        const text = node.astext();
        let encoded = this.encode(text);
        if (this.inMailto && this.settings.cloakEmailAddresses) {
            encoded = this.cloakEmail(encoded);
        }
        this.body.push(encoded);
    }

    depart_Text(node) {

    }

    visit_abbreviation(node) {
        // @@@ implementation incomplete ("title" attribute)
        this.body.push(this.starttag(node, 'abbr', ''));
    }

    depart_abbreviation(node) {
        this.body.push('</abbr>');
    }

    visit_acronym(node) {
        // @@@ implementation incomplete ("title" attribute)
        this.body.push(this.starttag(node, 'acronym', ''));
    }

    depart_acronym(node) {
        this.body.push('</acronym>');
    }

    visit_address(node) {
        this.visit_docinfo_item(node, 'address', meta = false);
        this.body.push(this.starttag(node, 'pre',
                                     suffix = '', false, { CLASS: 'address' }));
    }

    depart_address(node) {
        this.body.push('\n</pre>\n');
        this.depart_docinfo_item();
    }

    visit_admonition(node) {
        node.attributes.classes.splice(0, 0, 'admonition');
        this.body.push(this.starttag(node, 'div'));
    }

    depart_admonition(node = None) {
        this.body.push('</div>\n');

        attribution_formats = {
 dash: ['\u2014', ''],
                               parentheses: ['(', ')'],
                               parens: ['(', ')'],
                               none: ['', ''],
};
    }

    visit_attribution(node) {
        prefix, suffix = this.attribution_formats[this.settings.attribution];
        this.context.push(suffix);
        this.body.push(
            this.starttag(node, 'p', prefix, CLASS = 'attribution'),
);
    }

    depart_attribution(node) {
        this.body.push(`${this.context.pop()}</p>\n`);
    }

    visit_author(node) {
        if (!(node.parent instanceof nodes.authors)) {
            this.visit_docinfo_item(node, 'author');
        }
        this.body.push('<p>');
    }

    depart_author(node) {
        this.body.push('</p>');
        if (!(node.parent instanceof nodes.authors)) {
            this.body.push('\n');
        } else {
            this.depart_docinfo_item();
        }
    }

    visit_authors(node) {
        this.visit_docinfo_item(node, 'authors');
    }

    depart_authors(node) {
        this.depart_docinfo_item();
    }

    visit_block_quote(node) {
        this.body.push(this.starttag(node, 'blockquote'));
    }

    depart_block_quote(node) {
        this.body.push('</blockquote>\n');
    }

    check_simple_list(node) {
        // /"""Check for a simple list that can be rendered compactly."""
        const visitor = new SimpleListChecker(this.document);
        try {
            node.walk(visitor);
        } catch (error) {
            if (error instanceof nodes.NodeFound) {
                return false;
            }
            throw error;
        }
        return true;

        // Compact lists
        // ------------
        // Include definition lists and field lists (in addition to ordered
        // and unordered lists) in the test if a list is "simple"  (cf. the
    }
    // html4css1.HTMLTranslator docstring and the SimpleListChecker class at
    // the end of this file).

    is_compactable(node) {
        // print "is_compactable %s ?" % node.__class__,
        // explicite class arguments have precedence
        if ('compact' in node.attributes.classes) {
            return true;
        }
        if ('open' in node.attributes.classes) {
            return false;
        }
        // check config setting:
        if ((node instanceof nodes.field_list || node instanceof nodes.definition_list) && !this.settings.compactFieldList) {
            // print "`compact-field-lists` is false"
            return false;
        }
        if ((node instanceof nodes.enumerated_list || node instanceof nodes.bullet_list) && !this.settings.compactLists) {
            // print "`compact-lists` is false"
            return false;
        }
        // more special cases:
        if ((this.topicClasses.length === 1 && this.topicClasses[0] === 'contents')) { // TODO: this.in_contents
            return true;
        }
        // check the list items:
        return this.checkSimpleList(node);
    }

    visit_bullet_list(node) {
        const atts = {};
        const oldCompactSimple = this.compactSimple;
        this.compactParagraph = undefined;
        this.compactSimple = this.isCompactable(node);
        if (this.compactSimple && !oldCompactSimple) {
            atts.class = 'simple';
        }
        this.body.push(this.starttag(node, 'ul', atts));
    }

    depart_bullet_list(node) {
        this.compactSimple = this.context.pop();
        this.compactParagraph = this.compactSimple;
        this.body.push('</ul>\n');
    }

    visit_caption(node) {
        this.body.push(this.starttag(node, 'p', '', false, { CLASS: 'caption' }));
    }

    depart_caption(node) {
        this.body.push('</p>\n');
    }

    // citations
    // ---------
    // Use definition list instead of table for bibliographic references.
    // Join adjacent citation entries.

    visit_citation(node) {
        if (!this.inFootnoteList) {
            this.body.push('<dl class="citation">\n');
        }
        this.inFootnoteList = true;
    }

    depart_citation(node) {
        this.body.push('</dd>\n');
        if (!(node.nextNode(undefined, false, false, true, false) instanceof nodes.citation)) {
            this.body.push('</dl>\n');
            this.inFootnoteList = false;
        }
    }

    visit_citation_reference(node) {
        let href = '#';
        if ('refid' in node.attributes) {
            href += node.attributes.refid;
        } else if ('refame' in node.attributes) {
            href += this.document.nameIds[node.attributes.refname];
        }
        // else: // TODO system message (or already in the transform)?
        // 'Citation reference missing.'
        this.body.push(this.starttag(
            node, 'a', '[', false, { CLASS: 'citation-reference', href },
));
    }


    depart_citation_reference(node) {
        this.body.push(']</a>');

        // classifier
        // ----------
        // don't insert classifier-delimiter here (done by CSS)
    }

    visit_classifier(node) {
        this.body.push(this.starttag(node, 'span', '', false, { CLASS: 'classifier' }));
    }

    depart_classifier(node) {
        this.body.push('</span>');
    }

    visit_colspec(node) {
        this.colSpecs.push(node);
        // "stubs" list is an attribute of the tgroup element:
        node.parent.stubs.push(node.attributes.stub);
    }

/*    depart_colspec( node) {
        // write out <colgroup> when all colspecs are processed
        if isinstance(node.next_node(descend=false, siblings=true),
                      nodes.colspec):
        return
        if 'colwidths-auto' in node.parent.parent['classes'] or (
            'colwidths-auto' in this.settings.table_style and
            ('colwidths-given' not in node.parent.parent['classes'])):
        return
        total_width = sum(node.attributes['colwidth'] for node in this.colspecs)
        this.body.push(this.starttag(node, 'colgroup'))
        for node in this.colspecs:
        colwidth = int(node.attributes['colwidth'] * 100.0 / total_width + 0.5)
        this.body.push(this.emptytag(node, 'col',
                                     style='width: %i%%' % colwidth))
        this.body.push('</colgroup>\n')

        visit_comment(self, node,
                      sub=re.compile('-(?=-)').sub):
        """Escape double-dashes in comment text."""
        this.body.push('<!-- %s -->\n' % sub('- ', node.astext()))
    }
    // Content already processed:
    raise nodes.SkipNode

    visit_compound( node) {
        this.body.push(this.starttag(node, 'div', { CLASS: 'compound' }))
        if len(node) > 1:
        node.attributes[0]['classes'].push('compound-first')
        node.attributes[-1]['classes'].push('compound-last')
        for child in node.attributes[1:-1]:
        child['classes'].push('compound-middle')
    }

    depart_compound( node) {
        this.body.push('</div>\n')
    }

    visit_container( node) {
        this.body.push(this.starttag(node, 'div', { CLASS: 'docutils container' }))
    }

    depart_container( node) {
        this.body.push('</div>\n')
    }

    visit_contact( node) {
        this.visit_docinfo_item(node, 'contact', meta=false)
    }

    depart_contact( node) {
        this.depart_docinfo_item()
    }

    visit_copyright( node) {
        this.visit_docinfo_item(node, 'copyright')
    }

    depart_copyright( node) {
        this.depart_docinfo_item()
    }

    visit_date( node) {
        this.visit_docinfo_item(node, 'date')
    }

    depart_date( node) {
        this.depart_docinfo_item()
    }

    visit_decoration( node) {
    }
    pass

    depart_decoration( node) {
    }
    pass

    visit_definition( node) {
        this.body.push('</dt>\n')
        this.body.push(this.starttag(node, 'dd', ''))
    }

    depart_definition( node) {
        this.body.push('</dd>\n')
    }

    visit_definition_list( node) {
        classes = node.setdefault('classes', [])
        if this.is_compactable(node):
        classes.push('simple')
        this.body.push(this.starttag(node, 'dl'))
    }

    depart_definition_list( node) {
        this.body.push('</dl>\n')
    }

    visit_definition_list_item( node) {
        // pass class arguments, ids and names to definition term:
        node.children[0]['classes'] = (
            node.get('classes', []) + node.children[0].get('classes', []))
        node.children[0]['ids'] = (
            node.get('ids', []) + node.children[0].get('ids', []))
        node.children[0]['names'] = (
            node.get('names', []) + node.children[0].get('names', []))
    }

    depart_definition_list_item( node) {
    }
    pass

    visit_description( node) {
        this.body.push(this.starttag(node, 'dd', ''))
    }

    depart_description( node) {
        this.body.push('</dd>\n')
    }

    visit_docinfo( node) {
        this.context.push(len(this.body))
        classes = 'docinfo'
        if (this.is_compactable(node)):
        classes += ' simple'
        this.body.push(this.starttag(node, 'dl', CLASS=classes))
    }

    depart_docinfo( node) {
        this.body.push('</dl>\n')
        start = this.context.pop()
    }
    this.docinfo = this.body[start:]
    this.body = []

    visit_docinfo_item( node, name, meta=true) {
        if meta:
        meta_tag = '<meta name="%s" content="%s" />\n' \
            % (name, this.attval(node.astext()))
        this.add_meta(meta_tag)
        this.body.push('<dt class="%s">%s</dt>\n'
                       % (name, this.language.labels[name]))
        this.body.push(this.starttag(node, 'dd', '', CLASS=name))
    }

    depart_docinfo_item() {
        this.body.push('</dd>\n')
    }

    visit_doctest_block( node) {
        this.body.push(this.starttag(node, 'pre', suffix='',
                                    }
                       { CLASS: 'code python doctest' }))

    depart_doctest_block( node) {
        this.body.push('\n</pre>\n')
    }

    visit_document( node) {
        title = (node.get('title', '') or os.path.basename(node.attributes['source'])
                 or 'docutils document without title')
        this.head.push('<title>%s</title>\n' % this.encode(title))
    }

    depart_document( node) {
        this.head_prefix.extend([this.doctype,
                                 this.head_prefix_template %
                                 {'lang': this.settings.language_code}])
        this.html_prolog.push(this.doctype)
        this.meta.splice(0, 0, this.content_type % this.settings.output_encoding)
        this.head.splice(0, 0, this.content_type % this.settings.output_encoding)
        if 'name="dcterms.' in ''.join(this.meta):
        this.head.push(
            '<link rel="schema.dcterms" href="http://purl.org/dc/terms/">')
        if this.math_header:
        if this.math_output == 'mathjax':
        this.head.extend(this.math_header)
        else:
        this.stylesheet.extend(this.math_header)
        // skip content-type meta tag with interpolated charset value:
        this.htmlHead.extend(this.head[1:])
        this.bodyPrefix.push(this.starttag(node, 'div', { CLASS: 'document' }))
        this.bodySuffix.insert(0, '</div>\n')
        this.fragment.extend(this.body) // this.fragment is the "naked" body
        this.htmlBody.extend(this.bodyPrefix[1:] + this.body_pre_docinfo
                             + this.docinfo + this.body
                             + this.body_suffix[:-1])
        //        assert not this.context, 'len(context) = %s' % len(this.context)
    }

    visit_emphasis( node) {
        this.body.push(this.starttag(node, 'em', ''))
    }

    depart_emphasis( node) {
        this.body.push('</em>')
    }

    visit_entry( node) {
        const atts = {'class': []}
        if(node.parent.parnet instanceof nodes.thead) {
            atts['class'].push('head');
        }
        if(node.parent.parent.parent.stubs[node.parent.column]) {
            // "stubs" list is an attribute of the tgroup element
            atts['class'].push('stub')
        }
        let tagname;
        if(atts['class'].length) {
            tagname = 'th'
            atts['class'] = (atts['class'].join(' '));
        } else {
            tagname = 'td'
            delete atts['class'];
        }
        node.parent.column += 1;
        if('morerows' in node.attributes) {
            atts['rowspan'] = node.attributes['morerows'] + 1;
        }
        if('morecols' in node.attributes) {
            atts['colspan'] = node.attributes['morecols'] + 1
            node.parent.column += node.attributes['morecols'];
        }
        this.body.push(this.starttag(node, tagname, '', **atts))
        this.context.push(`</${tagname.toLowerCase()}>\n`);
        // TODO: why does the html4css1 writer insert an NBSP into empty cells?
        // if len(node) == 0:              // empty cell
        //     this.body.push('&//0160;') // no-break space
    }

    depart_entry( node) {
        this.body.push(this.context.pop())
    }

    visit_enumerated_list( node) {
        atts = {}
        if 'start' in node:
        atts['start'] = node.attributes['start']
        if 'enumtype' in node:
        atts['class'] = node.attributes['enumtype']
        if this.is_compactable(node):
        atts['class'] = (atts.get('class', '') + ' simple').strip()
        this.body.push(this.starttag(node, 'ol', **atts))
    }

    depart_enumerated_list( node) {
        this.body.push('</ol>\n')
    }
*/
    visit_field_list( node) {
        // Keep simple paragraphs in the field_body to enable CSS
        // rule to start body on new line if the label is too long
        let classes = 'field-list'
        if (this.isCompactable(node)) {
            classes += ' simple';
	}
        this.body.push(this.starttag(node, 'dl', '\n', false, { CLASS: classes }))
    }

    depart_field_list( node) {
        this.body.push('</dl>\n')
    }

    visit_field( node) {
    }

    depart_field( node) {
    }

    // as field is ignored, pass class arguments to field-name and field-body:

    visit_field_name( node) {
        this.body.push(this.starttag(node, 'dt', '', false, 
                                     { CLASS: node.parent.attributes['classes'].join(' ') }));
    }

    depart_field_name( node) {
        this.body.push('</dt>\n')
    }

    visit_field_body( node) {
        this.body.push(this.starttag(node, 'dd', '', false, 
                                     { CLASS: node.parent.attributes['classes'].join(' ') }));

        // prevent misalignment of following content if the field is empty:
        if(!node.children.length) {
            this.body.push('<p></p>');
	}
    }

    depart_field_body( node) {
        this.body.push('</dd>\n')
    }

/*    visit_figure( node) {
        atts = {'class': 'figure'}
        if node.get('width'):
        atts['style'] = 'width: %s' % node.attributes['width']
        if node.get('align'):
        atts['class'] += " align-" + node.attributes['align']
        this.body.push(this.starttag(node, 'div', **atts))
    }

    depart_figure( node) {
        this.body.push('</div>\n')
    }

    // use HTML 5 <footer> element?
    visit_footer( node) {
        this.context.push(len(this.body))
    }

    depart_footer( node) {
        start = this.context.pop()
        footer = [this.starttag(node, 'div', { CLASS: 'footer' }),
                  '<hr class="footer" />\n']
        footer.extend(this.body[start:])
        footer.push('\n</div>\n')
        this.footer.extend(footer)
        this.body_suffix[:0] = footer
        del this.body[start:]

        // footnotes
        // ---------
        // use definition list instead of table for footnote text

        // TODO: use the new HTML5 element <aside>? (Also for footnote text)
    }
*/
    visit_footnote( node) {
        if(!this.inFootnoteList) {
            const classes = `footnote ${this.settings.footnoteReferences}`;
            this.body.push(`<dl class="${classes}">\n`);
	    this.inFootnoteList = true;
	}
    }

    depart_footnote( node) {
        this.body.push('</dd>\n')
        if(! node.nextNode(undefined, false, false, true) instanceof nodes.footnote) {
            this.body.push('</dl>\n')
	    this.inFootnoteList = false
	}
    }

    /* whoops this requires references transform!! */
    visit_footnote_reference( node) {
	if(!node.attributes.refid) {
	    console.log('warning, no refid ( implement transforms )');
	}
        const href = `#${node.attributes.refid || ''}`;
        const classes = `footnote-reference ${this.settings.footnoteReferences}`;
        this.body.push(this.starttag(node, 'a', '', //suffix,
				     false,
				     { CLASS: classes, href }));
    }

    depart_footnote_reference( node) {
        this.body.push('</a>')
    }

/*    // Docutils-generated text: put section numbers in a span for CSS styling:
    visit_generated( node) {
        if 'sectnum' in node.attributes['classes']:
        // get section number (strip trailing no-break-spaces)
        sectnum = node.astext().rstrip(u' ')
        // print sectnum.encode('utf-8')
        this.body.push('<span class="sectnum">%s</span> '
                       % this.encode(sectnum))
    }
    // Content already processed:
    raise nodes.SkipNode

    depart_generated( node) {
    }
    pass

    visit_header( node) {
        this.context.push(len(this.body))
    }

    depart_header( node) {
        start = this.context.pop()
        header = [this.starttag(node, 'div', { CLASS: 'header' })]
        header.extend(this.body[start:])
        header.push('\n<hr class="header"/>\n</div>\n')
        this.bodyPrefix.extend(header)
        this.header.extend(header)
    }
    del this.body[start:]

    // Image types to place in an <object> element
    object_image_types = {'.swf': 'application/x-shockwave-flash'}

    visit_image( node) {
        atts = {}
        uri = node.attributes['uri']
        ext = os.path.splitext(uri)[1].lower()
        if ext in this.object_image_types:
        atts['data'] = uri
        atts['type'] = this.object_image_types[ext]
        else:
        atts['src'] = uri
        atts['alt'] = node.get('alt', uri)
        // image size
        if 'width' in node:
        atts['width'] = node.attributes['width']
        if 'height' in node:
        atts['height'] = node.attributes['height']
        if 'scale' in node:
        if (PIL and not ('width' in node and 'height' in node)
            and this.settings.file_insertion_enabled):
        imagepath = urllib.url2pathname(uri)
        try:
        img = PIL.Image.open(
            imagepath.encode(sys.getfilesystemencoding()))
        except (IOError, UnicodeEncodeError):
        pass // TODO: warn?
        else:
        this.settings.record_dependencies.add(
            imagepath.replace('\\', '/'))
        if 'width' not in atts:
        atts['width'] = '%dpx' % img.size[0]
        if 'height' not in atts:
        atts['height'] = '%dpx' % img.size[1]
        del img
        for att_name in 'width', 'height':
        if att_name in atts:
        match = re.match(r'([0-9.]+)(\S*)$', atts[att_name])
        assert match
        atts[att_name] = '%s%s' % (
            float(match.group(1)) * (float(node.attributes['scale']) / 100),
            match.group(2))
        style = []
        for att_name in 'width', 'height':
        if att_name in atts:
        if re.match(r'^[0-9.]+$', atts[att_name]):
        // Interpret unitless values as pixels.
        atts[att_name] += 'px'
        style.push('%s: %s;' % (att_name, atts[att_name]))
        del atts[att_name]
        if style:
        atts['style'] = ' '.join(style)
        if (isinstance(node.parent, nodes.TextElement) or
            (isinstance(node.parent, nodes.reference) and
             not isinstance(node.parent.parent, nodes.TextElement))):
        // Inline context or surrounded by <a>...</a>.
        suffix = ''
        else:
        suffix = '\n'
        if 'align' in node:
        atts['class'] = 'align-%s' % node.attributes['align']
        if ext in this.object_image_types:
        // do NOT use an empty tag: incorrect rendering in browsers
        this.body.push(this.starttag(node, 'object', suffix, **atts) +
                       node.get('alt', uri) + '</object>' + suffix)
        else:
        this.body.push(this.emptytag(node, 'img', suffix, **atts))
    }

    depart_image( node) {
        // this.body.push(this.context.pop())
    }
    pass

    visit_inline( node) {
        this.body.push(this.starttag(node, 'span', ''))
    }

    depart_inline( node) {
        this.body.push('</span>')
    }

    // footnote and citation labels:
    visit_label( node) {
        if (isinstance(node.parent, nodes.footnote)):
        classes = this.settings.footnote_references
        else:
        classes = 'brackets'
        // pass parent node to get id into starttag:
        this.body.push(this.starttag(node.parent, 'dt', '', { CLASS: 'label' }))
        this.body.push(this.starttag(node, 'span', '', CLASS=classes))
        // footnote/citation backrefs:
        if this.settings.footnote_backlinks:
        backrefs = node.parent['backrefs']
        if len(backrefs) == 1:
        this.body.push('<a class="fn-backref" href="//%s">'
                      }
            % backrefs[0])

    depart_label( node) {
        if this.settings.footnote_backlinks:
        backrefs = node.parent['backrefs']
        if len(backrefs) == 1:
        this.body.push('</a>')
        this.body.push('</span>')
        if this.settings.footnote_backlinks and len(backrefs) > 1:
        backlinks = ['<a href="//%s">%s</a>' % (ref, i)
                     for (i, ref) in enumerate(backrefs, 1)]
        this.body.push('<span class="fn-backref">(%s)</span>'
                       % ','.join(backlinks))
        this.body.push('</dt>\n<dd>')
    }

    visit_legend( node) {
        this.body.push(this.starttag(node, 'div', { CLASS: 'legend' }))
    }

    depart_legend( node) {
        this.body.push('</div>\n')
    }

    visit_line( node) {
        this.body.push(this.starttag(node, 'div', suffix='', { CLASS: 'line' }))
        if not len(node):
        this.body.push('<br />')
    }

    depart_line( node) {
        this.body.push('</div>\n')
    }

    visit_line_block( node) {
        this.body.push(this.starttag(node, 'div', { CLASS: 'line-block' }))
    }

    depart_line_block( node) {
        this.body.push('</div>\n')
    }

    visit_list_item( node) {
        this.body.push(this.starttag(node, 'li', ''))
    }

    depart_list_item( node) {
        this.body.push('</li>\n')
    }
*/
    // inline literal
    visit_literal( node) {
        // special case: "code" role
        const classes = node.attributes.classes || [];
        if(classes.indexOf('code') !== -1) {
            // filter 'code' from class arguments
            //fixme //node.attributes['classes'] = [cls for cls in classes if cls != 'code']
            return this.body.push(this.starttag(node, 'span', '', false, { CLASS: 'docutils literal' }));
	}
        let text = node.astext();
        // remove hard line breaks (except if in a parsed-literal block)
        if(!node.parent instanceof nodes.literal_block) {
            text = text.replace('\n', ' ');
	}
        // Protect text like ``--an-option`` and the regular expression
        // ``[+]?(\d+(\.\d*)?|\.\d+)`` from bad line wrapping
	this.wordsAndSpaces.findall(text).forEach((token) => {
	    if(token.trim() && this.inWordWrapPoint.search(token)) {
		this.body.push(`<span class="pre">${this.encode(token)}</span>`);
	    } else {
		this.body.push(this.encode(token));
	    }
	});
        this.body.push('</span>')
	// Content already processed:
	throw new nodes.SkipNode();
    }

    depart_literal( node) {
        // skipped unless literal element is from "code" role:
        this.body.push('</code>')
    }
/*
    visit_literal_block( node) {
        this.body.push(this.starttag(node, 'pre', '', { CLASS: 'literal-block' }))
        if 'code' in node.get('classes', []):
        this.body.push('<code>')
    }

    depart_literal_block( node) {
        if 'code' in node.get('classes', []):
        this.body.push('</code>')
        this.body.push('</pre>\n')

        // Mathematics:
        // As there is no native HTML math support, we provide alternatives
        // for the math-output: LaTeX and MathJax simply wrap the content,
        // HTML and MathML also convert the math_code.
        // HTML container
        math_tags = {// math_output: (block, inline, class-arguments)
            'mathml':      ('div', '', ''),
            'html':        ('div', 'span', 'formula'),
            'mathjax':     ('div', 'span', 'math'),
            'latex':       ('pre', 'tt',   'math'),
        }
    }

    visit_math( node, math_env='') {
        // If the method is called from visit_math_block(), math_env != ''.

        if this.math_output not in this.math_tags:
        this.document.reporter.error(
            'math-output format "%s" not supported '
            'falling back to "latex"'% this.math_output)
        this.math_output = 'latex'
        tag = this.math_tags[this.math_output][math_env == '']
        clsarg = this.math_tags[this.math_output][2]
        // LaTeX container
        wrappers = {// math_mode: (inline, block)
            'mathml':  ('$%s$',   u'\\begin{%s}\n%s\n\\end{%s}'),
            'html':    ('$%s$',   u'\\begin{%s}\n%s\n\\end{%s}'),
            'mathjax': (r'\(%s\)', u'\\begin{%s}\n%s\n\\end{%s}'),
            'latex':   (None,     None),
        }
        wrapper = wrappers[this.math_output][math_env != '']
        if this.math_output == 'mathml' and (not this.math_output_options or
                                             this.math_output_options[0] == 'blahtexml'):
        wrapper = None
        // get and wrap content
        math_code = node.astext().translate(unichar2tex.uni2tex_table)
        if wrapper:
        try: // wrapper with three "%s"
        math_code = wrapper % (math_env, math_code, math_env)
        except TypeError: // wrapper with one "%s"
        math_code = wrapper % math_code
        // settings and conversion
        if this.math_output in ('latex', 'mathjax'):
        math_code = this.encode(math_code)
        if this.math_output == 'mathjax' and not this.math_header:
        try:
        this.mathjax_url = this.math_output_options[0]
        except IndexError:
        this.document.reporter.warning('No MathJax URL specified, '
                                       'using local fallback (see config.html)')
        // append configuration, if not already present in the URL:
        // input LaTeX with AMS, output common HTML
        if '?' not in this.mathjax_url:
        this.mathjax_url += '?config=TeX-AMS_CHTML'
        this.math_header = [this.mathjax_script % this.mathjax_url]
        elif this.math_output == 'html':
        if this.math_output_options and not this.math_header:
        this.math_header = [this.stylesheet_call(
            utils.find_file_in_dirs(s, this.settings.stylesheet_dirs))
                            for s in this.math_output_options[0].split(',')]
        // TODO: fix display mode in matrices and fractions
        math2html.DocumentParameters.displaymode = (math_env != '')
        math_code = math2html.math2html(math_code)
        elif this.math_output == 'mathml':
        if  'XHTML 1' in this.doctype:
        this.doctype = this.doctype_mathml
        this.content_type = this.content_type_mathml
        converter = ' '.join(this.math_output_options).lower()
        try:
        if converter == 'latexml':
        math_code = tex2mathml_extern.latexml(math_code,
                                              this.document.reporter)
        elif converter == 'ttm':
        math_code = tex2mathml_extern.ttm(math_code,
                                          this.document.reporter)
        elif converter == 'blahtexml':
        math_code = tex2mathml_extern.blahtexml(math_code,
                                                inline=not(math_env),
                                                reporter=this.document.reporter)
        elif not converter:
        math_code = latex2mathml.tex2mathml(math_code,
                                            inline=not(math_env))
        else:
        this.document.reporter.error('option "%s" not supported '
                                     'with math-output "MathML"')
        except OSError:
        raise OSError('is "latexmlmath" in your PATH?')
        except SyntaxError, err:
        err_node = this.document.reporter.error(err, base_node=node)
        this.visit_system_message(err_node)
        this.body.push(this.starttag(node, 'p'))
        this.body.push(u','.join(err.args))
        this.body.push('</p>\n')
        this.body.push(this.starttag(node, 'pre',
                                     { CLASS: 'literal-block' }))
        this.body.push(this.encode(math_code))
        this.body.push('\n</pre>\n')
        this.depart_system_message(err_node)
        raise nodes.SkipNode
        // append to document body
        if tag:
        this.body.push(this.starttag(node, tag,
                                     suffix='\n'*bool(math_env),
                                     CLASS=clsarg))
        this.body.push(math_code)
        if math_env: // block mode (equation, display)
        this.body.push('\n')
        if tag:
        this.body.push('</%s>' % tag)
        if math_env:
        this.body.push('\n')
    }
    // Content already processed:
    raise nodes.SkipNode

    depart_math( node) {
    }
    pass // never reached

    visit_math_block( node) {
        // print node.astext().encode('utf8')
        math_env = pick_math_environment(node.astext())
        this.visit_math(node, math_env=math_env)
    }

    depart_math_block( node) {
    }
    pass // never reached

    // Meta tags: 'lang' attribute replaced by 'xml:lang' in XHTML 1.1
    // HTML5/polyglot recommends using both
    visit_meta( node) {
        meta = this.emptytag(node, 'meta', **node.non_default_attributes())
        this.add_meta(meta)
    }

    depart_meta( node) {
    }
    pass

    add_meta( tag) {
        this.meta.push(tag)
        this.head.push(tag)
    }

    visit_option( node) {
        this.body.push(this.starttag(node, 'span', '', { CLASS: 'option' }))
    }

    depart_option( node) {
        this.body.push('</span>')
        if isinstance(node.next_node(descend=false, siblings=true),
                      nodes.option):
        this.body.push(', ')
    }

    visit_option_argument( node) {
        this.body.push(node.get('delimiter', ' '))
        this.body.push(this.starttag(node, 'var', ''))
    }

    depart_option_argument( node) {
        this.body.push('</var>')
    }

    visit_option_group( node) {
        this.body.push(this.starttag(node, 'dt', ''))
        this.body.push('<kbd>')
    }

    depart_option_group( node) {
        this.body.push('</kbd></dt>\n')
    }

    visit_option_list( node) {
        this.body.push(
            this.starttag(node, 'dl', { CLASS: 'option-list' }))
    }

    depart_option_list( node) {
        this.body.push('</dl>\n')
    }

    visit_option_list_item( node) {
    }
    pass

    depart_option_list_item( node) {
    }
    pass

    visit_option_string( node) {
    }
    pass

    depart_option_string( node) {
    }
    pass

    visit_organization( node) {
        this.visit_docinfo_item(node, 'organization')
    }

    depart_organization( node) {
        this.depart_docinfo_item()

        // Do not omit <p> tags
        // --------------------
        //
        // The HTML4CSS1 writer does this to "produce
        // visually compact lists (less vertical whitespace)". This writer
    }
    // relies on CSS rules for"visual compactness".
    //
    // * In XHTML 1.1, e.g. a <blockquote> element may not contain
    //   character data, so you cannot drop the <p> tags.
    // * Keeping simple paragraphs in the field_body enables a CSS
    //   rule to start the field-body on a new line if the label is too long
    // * it makes the code simpler.
    //
    // TODO: omit paragraph tags in simple table cells?

    visit_paragraph( node) {
        this.body.push(this.starttag(node, 'p', ''))
    }

    depart_paragraph( node) {
        this.body.push('</p>')
        if not (isinstance(node.parent, (nodes.list_item, nodes.entry)) and
                (len(node.parent) == 1)):
        this.body.push('\n')
    }

    visit_problematic( node) {
        if node.hasattr('refid'):
        this.body.push('<a href="//%s">' % node.attributes['refid'])
        this.context.push('</a>')
        else:
        this.context.push('')
        this.body.push(this.starttag(node, 'span', '', { CLASS: 'problematic' }))
    }

    depart_problematic( node) {
        this.body.push('</span>')
        this.body.push(this.context.pop())
    }

    visit_raw( node) {
        if 'html' in node.get('format', '').split():
        t = isinstance(node.parent, nodes.TextElement) and 'span' or 'div'
        if node.attributes['classes']:
        this.body.push(this.starttag(node, t, suffix=''))
        this.body.push(node.astext())
        if node.attributes['classes']:
        this.body.push('</%s>' % t)
    // Keep non-HTML raw text out of output:
    raise nodes.SkipNode
    }
*/
    visit_reference( node) {
        const atts = {'class': 'reference'}
        if('refuri' in node.attributes) {
            atts['href'] = node.attributes['refuri'];
            if ( this.settings.cloakEmailAddresses
		 && atts['href'].substring(0, 6) === 'mailto:') {
		atts['href'] = this.cloakMailto(atts['href'])
		this.in_mailto = true
	    }
            atts['class'] += ' external';
	} else {
            //assert 'refid' in node, \ 'References must have "refuri" or "refid" attribute.'
            atts['href'] = '#' + node.attributes['refid']
            atts['class'] += ' internal';
	}
	
        if(!node.parent instanceof nodes.TextElement) {
            //assert len(node) == 1 and isinstance(node.attributes[0], nodes.image)
            atts['class'] += ' image-reference';
	}
        this.body.push(this.starttag(node, 'a', '', false, atts));
    }

    depart_reference( node) {
        this.body.push('</a>')
        if(!node.parent instanceof nodes.TextElement) {
            this.body.push('\n')
	}
	this.inMailto = false;
    }
/*
    visit_revision( node) {
        this.visit_docinfo_item(node, 'revision', meta=false)
    }

    depart_revision( node) {
        this.depart_docinfo_item()
    }

    visit_row( node) {
        this.body.push(this.starttag(node, 'tr', ''))
    }
    node.column = 0

    depart_row( node) {
        this.body.push('</tr>\n')
    }

    visit_rubric( node) {
        this.body.push(this.starttag(node, 'p', '', { CLASS: 'rubric' }))
    }

    depart_rubric( node) {
        this.body.push('</p>\n')
    }

    // TODO: use the new HTML 5 element <section>?
    visit_section( node) {
        this.section_level += 1
        this.body.push(
            this.starttag(node, 'div', { CLASS: 'section' }))
    }

    depart_section( node) {
        this.section_level -= 1
        this.body.push('</div>\n')

        // TODO: use the new HTML5 element <aside>? (Also for footnote text)
    }
    visit_sidebar( node) {
        this.body.push(
            this.starttag(node, 'div', { CLASS: 'sidebar' }))
    }
    this.in_sidebar = true

    depart_sidebar( node) {
        this.body.push('</div>\n')
    }
    this.in_sidebar = false

    visit_status( node) {
        this.visit_docinfo_item(node, 'status', meta=false)
    }

    depart_status( node) {
        this.depart_docinfo_item()
    }

    visit_strong( node) {
        this.body.push(this.starttag(node, 'strong', ''))
    }

    depart_strong( node) {
        this.body.push('</strong>')
    }

    visit_subscript( node) {
        this.body.push(this.starttag(node, 'sub', ''))
    }

    depart_subscript( node) {
        this.body.push('</sub>')
    }

    visit_substitution_definition( node) {
    }
    """Internal only."""
    raise nodes.SkipNode

    visit_substitution_reference( node) {
        this.unimplemented_visit(node)
    }

    // h1–h6 elements must not be used to markup subheadings, subtitles,
    // alternative titles and taglines unless intended to be the heading for a
    // new section or subsection.
    // -- http://www.w3.org/TR/html/sections.html//headings-and-sections
    visit_subtitle( node) {
        if isinstance(node.parent, nodes.sidebar):
        classes = 'sidebar-subtitle'
        elif isinstance(node.parent, nodes.document):
        classes = 'subtitle'
        this.in_document_title = len(this.body)+1
        elif isinstance(node.parent, nodes.section):
        classes = 'section-subtitle'
        this.body.push(this.starttag(node, 'p', '', CLASS=classes))
    }

    depart_subtitle( node) {
        this.body.push('</p>\n')
        if isinstance(node.parent, nodes.document):
        this.subtitle = this.body[this.in_document_title:-1]
        this.in_document_title = 0
        this.body_pre_docinfo.extend(this.body)
        this.html_subtitle.extend(this.body)
    }
    del this.body[:]

    visit_superscript( node) {
        this.body.push(this.starttag(node, 'sup', ''))
    }

    depart_superscript( node) {
        this.body.push('</sup>')
    }

    visit_system_message( node) {
        this.body.push(this.starttag(node, 'div', { CLASS: 'system-message' }))
        this.body.push('<p class="system-message-title">')
        backref_text = ''
        if len(node.attributes['backrefs']):
        backrefs = node.attributes['backrefs']
        if len(backrefs) == 1:
        backref_text = ('; <em><a href="//%s">backlink</a></em>'
                        % backrefs[0])
        else:
        i = 1
        backlinks = []
        for backref in backrefs:
        backlinks.push('<a href="//%s">%s</a>' % (backref, i))
        i += 1
        backref_text = ('; <em>backlinks: %s</em>'
                        % ', '.join(backlinks))
        if node.hasattr('line'):
        line = ', line %s' % node.attributes['line']
        else:
        line = ''
        this.body.push('System Message: %s/%s '
                       '(<span class="docutils literal">%s</span>%s)%s</p>\n'
                       % (node.attributes['type'], node.attributes['level'],
                          this.encode(node.attributes['source']), line, backref_text))
    }

    depart_system_message( node) {
        this.body.push('</div>\n')
    }

    visit_table( node) {
        atts = {}
        classes = [cls.strip(u' \t\n')
                   for cls in this.settings.table_style.split(',')]
        if 'align' in node:
        classes.push('align-%s' % node.attributes['align'])
        if 'width' in node:
        atts['style'] = 'width: %s' % node.attributes['width']
        tag = this.starttag(node, 'table', { CLASS: ' ' }.join(classes), **atts)
        this.body.push(tag)
    }

    depart_table( node) {
        this.body.push('</table>\n')
    }

    visit_target( node) {
        if not ('refuri' in node or 'refid' in node
                or 'refname' in node):
        this.body.push(this.starttag(node, 'span', '', { CLASS: 'target' }))
        this.context.push('</span>')
        else:
        this.context.push('')
    }

    depart_target( node) {
        this.body.push(this.context.pop())
    }

    // no hard-coded vertical alignment in table body
    visit_tbody( node) {
        this.body.push(this.starttag(node, 'tbody'))
    }

    depart_tbody( node) {
        this.body.push('</tbody>\n')
    }

    visit_term( node) {
        this.body.push(this.starttag(node, 'dt', ''))
    }

    depart_term( node) {
        """
        Leave the end tag to `this.visit_definition()`, in case there's a
}
        classifier.
        """
        pass

        visit_tgroup( node) {
        }
        this.colspecs = []
        node.stubs = []

        depart_tgroup( node) {
        }
        pass

        visit_thead( node) {
            this.body.push(this.starttag(node, 'thead'))
        }

        depart_thead( node) {
            this.body.push('</thead>\n')
        }

        visit_title_reference( node) {
            this.body.push(this.starttag(node, 'cite', ''))
        }

        depart_title_reference( node) {
            this.body.push('</cite>')

            // TODO: use the new HTML5 element <aside>? (Also for footnote text)
        }
        visit_topic( node) {
            this.body.push(this.starttag(node, 'div', { CLASS: 'topic' }))
        }
        this.topic_classes = node.attributes['classes']
        // TODO: replace with ::
        //   this.in_contents = 'contents' in node.attributes['classes']

        depart_topic( node) {
            this.body.push('</div>\n')
            this.topic_classes = []
            // TODO this.in_contents = false
        }

        visit_transition( node) {
            this.body.push(this.emptytag(node, 'hr', { CLASS: 'docutils' }))
        }

        depart_transition( node) {
        }

        visit_version( node) {
            this.visit_docinfo_item(node, 'version', meta=false)
        }

        depart_version( node) {
            this.depart_docinfo_item()
        }

        unimplemented_visit( node) {
            raise NotImplementedError('visiting unimplemented node type: %s'
                                      % node.__class__.__name__)
        }
        */
    visit_title(node) {
        // """Only 6 section levels are supported by HTML."""
        const checkId = 0; // TODO: is this a bool (false) or a counter?
        let closeTag = '</p>\n';
/*        if isinstance(node.parent, nodes.topic):
            this.body.push(
                  this.starttag(node, 'p', '', { CLASS: 'topic-title first' }))
        elif isinstance(node.parent, nodes.sidebar):
            this.body.push(
                  this.starttag(node, 'p', '', { CLASS: 'sidebar-title' }))
        elif isinstance(node.parent, nodes.Admonition):
            this.body.push(
                  this.starttag(node, 'p', '', { CLASS: 'admonition-title' }))
        elif isinstance(node.parent, nodes.table):
            this.body.push(
                  this.starttag(node, 'caption', ''))
            close_tag = '</caption>\n'
*/
        if (node.parent instanceof nodes.document) {
            this.body.push(this.starttag(node, 'h1', '', false, { CLASS: 'title' }));
            closeTag = '</h1>\n';
            this.inDocumentTitle = this.body.length;
        } else {
            // assert isinstance(node.parent, nodes.section)
            const headerLevel = this.sectionLevel + this.initialHeaderLevel - 1;
            let atts = {};
/*            if (len(node.parent) >= 2 and
                isinstance(node.parent[1], nodes.subtitle)):
                atts['CLASS'] = 'with-subtitle' */
            this.body.push(
                this.starttag(node, `h${headerLevel}`, '', false, atts),
);
            atts = {};
/*            if node.hasattr('refid'):
                atts['class'] = 'toc-backref'
                atts['href'] = '#' + node['refid']
            if atts:
                this.body.push(this.starttag({}, 'a', '', **atts))
                close_tag = '</a></h%s>\n' % (h_level)
            else: */
            closeTag = `</h${headerLevel}>\n`;
        }
        this.context.push(closeTag);
    }

    depart_title(node) {
        this.body.push(this.context.pop());
        if (this.inDocumentTitle) {
            this.title = this.body.slice(this.inDocumentTitle, this.body.length - 2);
            this.inDocumentTitle = 0;
            this.bodyPreDocinfo.push(...this.body);
            this.htmlTitle.push(...this.body);
            this.body.length = 0;
        }
    }

    visit_block_quote(node) {
        this.body.push(this.starttag(node, 'blockquote'));
    }

    depart_block_quote(node) {
        this.body.push('</blockquote>\n');
    }

    isCompactable(node) {
        return false;
    }

    visit_bullet_list(node) {
        const atts = {};
        const oldCompactSimple = this.compactSimple;
        this.compactParagraph = undefined;
        this.compactSimple = this.isCompactable(node);
        if (this.compactSimple && !oldCompactSimple) {
            atts.class = 'simple';
        }
        this.body.push(this.starttag(node, 'ul', atts));
    }

    depart_bullet_list(node) {
        this.compactSimple = this.context.pop();
        this.compactParagraph = this.compactSimple;
        this.body.push('</ul>\n');
    }

    visit_document() {
    }

    depart_document() {
    }


    visit_list_item(node) {
        this.body.push(this.starttag(node, 'li', ''));
    }

    depart_list_item(node) {
        this.body.push('</li>\n');
    }

    visit_paragraph(node) {
        this.body.push(this.starttag(node, 'p', ''));
    }

    depart_paragraph(node) {
        this.body.push('</p>');
        if (!((node.parent instanceof nodes.list_item
               || node.parent instanceof nodes.entry)
              && node.parent.length === 1)) {
            this.body.push('\n');
        }
    }

    passNode(node) {

    }

    ignoreNode(node) {
        throw new nodes.SkipNode();
    }
}

