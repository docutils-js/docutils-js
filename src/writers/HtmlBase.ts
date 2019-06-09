import * as ejs from 'ejs';
import BaseWriter from '../Writer';
import * as nodes from '../nodes';
import * as utils from '../utils';
import { basename } from '../utils/paths';
import { getLanguage } from '../languages';
import { UnimplementedError } from '../Exceptions';
import {Settings} from "../../gen/Settings";
import {Document, IAttributes, INode} from "../types";
import {row, tgroup} from "../nodes";

/* eslint-disable-next-line no-unused-vars */
const __docformat__ = 'reStructuredText';

/* eslint-disable-next-line no-unused-vars */
const __version__ = '';

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

/**
 * HTMLTranslator class
 */
class HTMLTranslator extends nodes.NodeVisitor {
    private body: string[];
    private settings: Settings;
    private language: any;
    private meta: string[];
    private headPrefix: string[];
    private htmlProlog: string[];
    private compactSimple: boolean;
    private context: string[];
    private compactParagraph?: boolean;
    private bodyPreDocinfo: string[];
    private inDocumentTitle: number;
    private htmlTitle: string[];
    private title: string[];
    private sectionLevel: number;
    private initialHeaderLevel: number;
    private topicClasses: string[];
    private topic: any;
    private colspecs: any[];
    private inMailto: boolean;
    private inFootnoteList: boolean;
    private doctype: string= '';
    private head: string[];
    private docinfo: string[];
    private attribution_formats: any;
    private mathHeader: any[];
    private authorInAuthors: boolean;
    private htmlBody: any[];
    private htmlSubtitle: any[];
    private htmlHead: any[];
    private footer: any[];
    private subtitle: any[];
    private header: any[];
    private inSidebar: boolean;
    private compactFieldList: boolean;
    private inDocinfo: boolean;
    private contentType?: string;
    private readonly langAttribute: string = 'lang';
    private mathOutput: any[];
    private mathOutputOptions: any[];
    private fragment: any[];
    private bodySuffix: string[];
    private bodyPrefix: string[];

    constructor(document: Document) {
        super(document);
        this.settings = document.settings;
        const settings = this.settings;
        const langCode = settings.docutilsCoreOptionParser!.languageCode;
        this.language = getLanguage(langCode, document.reporter);
        this.meta = [];// fixme: this.meta = [this.generator % docutils.__version__]
        this.headPrefix = [];
        this.htmlProlog = [];
        if (settings.docutilsWritersHtml4Css1Writer!.xmlDeclaration) {
            /*            this.head_prefix.append(this.xml_declaration
                          % settings.output_encoding)
                          # this.content_type = ""
                          # encoding not interpolated:
                          this.html_prolog.append(this.xml_declaration)
            */
        }
        this.head = this.meta.slice();
        /* fixme
           this.stylesheet = utils.getStylesheetList(settings).
           map(this.stylesheetCall.bind(this));
        */
        this.bodyPrefix = ['</head>\n<body>\n'];
        this.bodyPreDocinfo = [];
        this.docinfo = [];
        this.body = [];
        this.fragment = [];
        this.bodySuffix = ['</body>\n</html\n'];
        this.sectionLevel = 0;
        this.initialHeaderLevel = parseInt(settings.docutilsWritersHtml4Css1Writer!.initialHeaderLevel, 10);
        this.mathOutput = utils.pySplit(settings.docutilsWritersHtml4Css1Writer!.mathOutput || '');
        this.mathOutputOptions = this.mathOutput.slice(1, this.mathOutput.length - 1);
        this.mathOutput = this.mathOutput[0].toLowerCase();
        this.context = [];

        this.topicClasses = [];
        this.colspecs = [];
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
        this.inDocumentTitle = 0;
        this.inMailto = false;
        this.authorInAuthors = false;
        this.mathHeader = [];
    }

    /**
     * Cleanse, HTML encode, and return attribute value text.
     * @param {String} text - text to cleanse
     * @param {RegExp} whitespace - regexp for matching whitespace.
     */
    attVal(text: string, whitespace: RegExp = /[\n\r\t\v\f]/g) {
        if (!text) {
            text = '';
        }
        let encoded = this.encode(text.replace(whitespace, ' '));
        if (this.inMailto && this.settings.docutilsWritersHtml4Css1Writer!.cloakEmailAddresses) {
            // Cloak at-signs ("%40") and periods with HTML entities.
            encoded = encoded.replace('%40', '&#37;&#52;&#48;');
            encoded = encoded.replace('.', '&#46;');
        }
        return encoded;
    }

    /*
     * Construct and return a start tag given a node (id & class attributes
     * are extracted), tag name, and optional attributes.
     */
    starttag(node: INode, tagname: string = '', suffix: string = '\n', empty: boolean = false,
             attributes: IAttributes = {}) {
        if (typeof suffix !== 'string') {
            throw new Error('suffix should be a string!!');
        }

        const myTagname = tagname.toLowerCase();
        const prefix: any[] = [];
        const atts: any = {};
        const ids = [];
        Object.entries(attributes).forEach(([name, value]) => {
            atts[name.toLowerCase()] = value;
        });
        const classes: string[] = [];
        const languages: string[] = [];
        // unify class arguments and move language specification
        const c: string[] = (node.attributes && node.attributes.classes) || [];
        //      console.log(c);
        //      console.log(atts.class);
        c.splice(c.length - 1, 0, ...utils.pySplit(atts.class || ''));
        //      console.log(c);
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
        // attlist.sort()
        const parts = [myTagname];
        Object.keys(attlist).forEach((name: string) => {
            const value: any | any[] | undefined | null = attlist[name];
           // value=None was used for boolean attributes without
            // value, but this isn't supported by XHTML.
            //            assert value is not None
            if (Array.isArray(value)) {
                parts.push(`${name.toLowerCase()}="${this.attVal(value.join(' '))}"`);
            } else {
                parts.push(`${name.toLowerCase()}="${this.attVal(value.toString())}"`);
            }
        });
        const infix = empty ? ' /' : '';
        // return ''.join(prefix) + '<%s%s>' % (' '.join(parts), infix) + suffix
        const result = `${prefix.join('')}<${parts.join(' ')}${infix}>${suffix}`;
        const badStr = '[object Object]';
        if (result.indexOf(badStr) !== -1) {
            let invalidVar = '';
            if (prefix.join('').indexOf('[object Object]') !== -1) {
                invalidVar = 'prefix';
            } else if (parts.join(' ').indexOf(badStr) !== -1) {
                // implement fixme
            } else if (infix.indexOf(badStr) !== -1) {
                // implement fixme
            } else if (suffix.indexOf(badStr) !== -1) {
                invalidVar = 'suffix';
            }
            throw new Error(`invalid object in ${invalidVar} thing ${prefix} ${parts} ${infix}`);
        }
        return result;
    }

    /**
     * Construct and return an XML-compatible empty tag.
     */
    emptytag(node: INode, tagname: string, suffix = '\n', attributes: IAttributes = {}): string {
        return this.starttag(node, tagname, suffix, true, attributes);
    }


    encode(text: string): string {
        return text; // fixme
    }

    /* eslint-disable-next-line camelcase */
    visit_section(node: INode) {
        this.sectionLevel += 1;
        this.body.push(
            this.starttag(node, 'div', '\n', false, { CLASS: 'section' }),
        );
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    depart_section(node: INode) {
        this.sectionLevel -= 1;
        this.body.push('</div>\n');
    }

    /* eslint-disable-next-line camelcase */
    visit_Text(node: INode) {
        const text = node.astext();
        let encoded = this.encode(text);
        if (this.inMailto && this.settings.docutilsWritersHtml4Css1Writer!.cloakEmailAddresses) {
            encoded = this.cloakEmail(encoded);
        }
        this.body.push(encoded);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    depart_Text(node: INode) {

    }

    /* eslint-disable-next-line camelcase */
    visit_abbreviation(node: INode) {
        // @@@ implementation incomplete ("title" attribute)
        this.body.push(this.starttag(node, 'abbr', ''));
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    depart_abbreviation(node: INode) {
        this.body.push('</abbr>');
    }

    /* eslint-disable-next-line camelcase */
    visit_acronym(node: INode) {
        // @@@ implementation incomplete ("title" attribute)
        this.body.push(this.starttag(node, 'acronym', ''));
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    depart_acronym(node: INode) {
        this.body.push('</acronym>');
    }

    /* eslint-disable-next-line camelcase */
    /*
      visit_address(node: INode) {
      this.visitDocinfoItem(node, 'address', meta = false);
      this.body.push(this.starttag(node, 'pre',
      suffix = '', false, { CLASS: 'address' }));
      }

      depart_address(node: INode) {
      this.body.push('\n</pre>\n');
      this.departDocinfoItem();
      } */

    /* eslint-disable-next-line camelcase */
    visit_admonition(node: INode) {
        node.attributes.classes.splice(0, 0, 'admonition');
        this.body.push(this.starttag(node, 'div'));
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    depart_admonition(node: INode) {
        this.body.push('</div>\n');

        /* eslint-disable-next-line no-unused-vars */
        const attributionFormats = {
            dash: ['\u2014', ''],
            parentheses: ['(', ')'],
            parens: ['(', ')'],
            none: ['', ''],
        };
    }

    /* eslint-disable-next-line camelcase */
    visit_attribution(node: INode) {
        const [prefix, suffix] = this.attribution_formats[this.settings.docutilsWritersHtml4Css1Writer!.attribution];
        this.context.push(suffix);
        this.body.push(
            this.starttag(node, 'p', prefix, false, { CLASS: 'attribution' }),
        );
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    depart_attribution(node: INode) {
        this.body.push(`${this.context.pop()}</p>\n`);
    }

    /* eslint-disable-next-line camelcase */
    visit_author(node: INode) {
        if (!(node.parent instanceof nodes.authors)) {
            this.visitDocinfoItem(node, 'author');
        }
        this.body.push('<p>');
    }

    /* eslint-disable-next-line camelcase */
    depart_author(node: INode) {
        this.body.push('</p>');
        if (!(node.parent instanceof nodes.authors)) {
            this.body.push('\n');
        } else {
            this.departDocinfoItem();
        }
    }

    /* eslint-disable-next-line camelcase */
    visit_authors(node: INode) {
        this.visitDocinfoItem(node, 'authors');
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    depart_authors(node: INode) {
        this.departDocinfoItem();
    }

    /* eslint-disable-next-line camelcase */
    visit_block_quote(node: INode) {
        this.body.push(this.starttag(node, 'blockquote'));
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    depart_block_quote(node: INode) {
        this.body.push('</blockquote>\n');
    }

    /*
     * Check for a simple list that can be rendered compactly.
     */
    /* eslint-disable-next-line camelcase */
    /*
      checkSimpleList(node: INode) {
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
      */

    /* eslint-disable-next-line camelcase */
    isCompactable(node: INode): boolean {
        // print "isCompactable %s ?" % node.__class__,
        // explicite class arguments have precedence
        if ('compact' in node.attributes.classes) {
            return true;
        }
        if ('open' in node.attributes.classes) {
            return false;
        }
        // check config setting:
        if ((node instanceof nodes.field_list
             || node instanceof nodes.definition_list)
            && !this.settings.docutilsWritersHtml4Css1Writer!.compactFieldLists) {
            // print "`compact-field-lists` is false"
            return false;
        }
        if ((node instanceof nodes.enumerated_list
             || node instanceof nodes.bullet_list)
            && !this.settings.docutilsWritersHtml4Css1Writer!.compactLists) {
            // print "`compact-lists` is false"
            return false;
        }
        // more special cases:
        if ((this.topicClasses.length === 1
             && this.topicClasses[0] === 'contents')) { // TODO: this.in_contents
            return true;
        }
        // check the list items:
        return this.checkSimpleList(node);
    }

    /* eslint-disable-next-line camelcase */
    visit_caption(node: INode) {
        this.body.push(this.starttag(node, 'p', '', false, { CLASS: 'caption' }));
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    depart_caption(node: INode) {
        this.body.push('</p>\n');
    }

    // citations
    // ---------
    // Use definition list instead of table for bibliographic references.
    // Join adjacent citation entries.

    /* eslint-disable-next-line camelcase,no-unused-vars */
    visit_citation(node: INode) {
        if (!this.inFootnoteList) {
            this.body.push('<dl class="citation">\n');
        }
        this.inFootnoteList = true;
    }

    /* eslint-disable-next-line camelcase */
    depart_citation(node: INode) {
        this.body.push('</dd>\n');
        if (!(node.nextNode({ descend: false, siblings: true }) instanceof nodes.citation)) {
            this.body.push('</dl>\n');
            this.inFootnoteList = false;
        }
    }

    /* eslint-disable-next-line camelcase */
    visit_citation_reference(node: INode) {
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


    /* eslint-disable-next-line camelcase,no-unused-vars */
    depart_citation_reference(node: INode) {
        this.body.push(']</a>');

        // classifier
        // ----------
        // don't insert classifier-delimiter here (done by CSS)
    }

    /* eslint-disable-next-line camelcase */
    visit_classifier(node: INode) {
        this.body.push(this.starttag(node, 'span', '', false, { CLASS: 'classifier' }));
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    depart_classifier(node: INode) {
        this.body.push('</span>');
    }

    /* eslint-disable-next-line camelcase */
    visit_colspec(node: INode) {
        this.colspecs.push(node);
        // "stubs" list is an attribute of the tgroup element:
        //node.parent!.stubs.push(node.attributes.stub); fixme
    }

    /* eslint-disable-next-line camelcase */
    depart_colspec(node: INode) {
        // write out <colgroup> when all colspecs are processed
        if (node.nextNode({ descend: false, siblings: true }) instanceof nodes.colspec) {
            return;
        }
        if ('colwidths-auto' in node.parent!.parent!.attributes.classes
            || ('colwidths-auto' in this.settings.docutilsWritersHtml4Css1Writer!.tableStyle
                && (!('colwidths-given' in node.parent!.parent!.attributes.classes)))) {
            return;
        }
        /* eslint-disable-next-line camelcase,no-unused-vars */
        const totalWidth = this.colspecs.map(subNode => subNode.attributes.colwidth)
              .reduce((a, c) => a + c);
        this.body.push(this.starttag(node, 'colgroup'));
        this.colspecs.forEach((subNode) => {
            const colWidth = parseInt(subNode.attributes.colwidth, 10) * 100.0 / totalWidth + 0.5;
            this.body.push(this.emptytag(subNode, 'col', '', { style: `width: ${colWidth}` }));
        });
        this.body.push('</colgroup>\n');
    }

    /*
      visit_comment(self, node,
      sub=re.compile('-(?=-)').sub):
      // Escape double-dashes in comment text.
      this.body.push('<!-- %s -->\n' % sub('- ', node.astext()))
      // Content already processed:
      raise nodes.SkipNode
      }

      visit_compound(node: INode) {
      this.body.push(this.starttag(node, 'div', { CLASS: 'compound' }))
      if len(node: INode) > 1:
      node.attributes[0]['classes'].push('compound-first')
      node.attributes[-1]['classes'].push('compound-last')
      for child in node.attributes[1:-1]:
      child['classes'].push('compound-middle')
      }

      depart_compound(node: INode) {
      this.body.push('</div>\n')
      }

    */
    /* eslint-disable-next-line camelcase */
    visit_container(node: INode) {
        this.body.push(this.starttag(node, 'div', '\n', false, { CLASS: 'docutils container' }));
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    depart_container(node: INode) {
        this.body.push('</div>\n');
    }

    /* eslint-disable-next-line camelcase */
    visit_contact(node: INode) {
        this.visitDocinfoItem(node, 'contact', false);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    depart_contact(node: INode) {
        this.departDocinfoItem();
    }

    /* eslint-disable-next-line camelcase */
    visit_copyright(node: INode) {
        this.visitDocinfoItem(node, 'copyright');
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    depart_copyright(node: INode) {
        this.departDocinfoItem();
    }

    /* eslint-disable-next-line camelcase */
    visit_date(node: INode) {
        this.visitDocinfoItem(node, 'date');
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    depart_date(node: INode) {
        this.departDocinfoItem();
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    visit_decoration(node: INode) {
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    depart_decoration(node: INode) {
    }

    /* eslint-disable-next-line camelcase */
    visit_definition(node: INode) {
        this.body.push('</dt>\n');
        this.body.push(this.starttag(node, 'dd', ''));
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    depart_definition(node: INode) {
        this.body.push('</dd>\n');
    }

    /* eslint-disable-next-line camelcase */
    visit_definition_list(node: INode) {
        if (node.attributes.classes == null) {
            node.attributes.classes = [];
        }
        const classes = node.attributes.classes;
        if (this.isCompactable(node)) {
            classes.push('simple');
        }
        this.body.push(this.starttag(node, 'dl'));
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    depart_definition_list(node: INode) {
        this.body.push('</dl>\n');
    }

    /* eslint-disable-next-line camelcase */
    visit_definition_list_item(node: INode) {
        // pass class arguments, ids and names to definition term:
        node.children[0].attributes.classes.splice(0, 0, ...(node.attributes.classes || []));
        node.children[0].attributes.ids.splice(0, 0, ...(node.attributes.ids || []));
        node.children[0].attributes.names.splice(0, 0, ...(node.attributes.names || []));
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    depart_definition_list_item(node: INode) {
    }

    /* eslint-disable-next-line camelcase */
    visit_description(node: INode) {
        this.body.push(this.starttag(node, 'dd', ''));
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    depart_description(node: INode) {
        this.body.push('</dd>\n');
    }

    /* eslint-disable-next-line camelcase */
    visit_docinfo(node: INode) {
        this.context.push(this.body.length.toString());
        let classes = 'docinfo';
        if (this.isCompactable(node)) {
            classes += ' simple';
        }
        this.body.push(this.starttag(node, 'dl', '\n', false, { CLASS: classes }));
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    depart_docinfo(node: INode) {
        this.body.push('</dl>\n');
        const start = this.context.pop()!;
        this.docinfo = this.body.slice(parseInt(start, 10));
        this.body = [];
    }

    visitDocinfoItem(node: INode, name: string, meta: boolean= true) {
        if (meta) {
            const metaTag = `<meta name="${name}" content="${this.attVal(node.astext())}" />\n`;
            this.addMeta(metaTag);
        }
        this.body.push(`<dt class="${name}">${this.language.labels[name]}</dt>\n`);
        this.body.push(this.starttag(node, 'dd', '', false, { CLASS: name }));
    }

    /* eslint-disable-next-line no-unused-vars */
    departDocinfoItem() {
        this.body.push('</dd>\n');
    }

    /* eslint-disable-next-line camelcase */
    visit_doctest_block(node: INode) {
        this.body.push(this.starttag(node, 'pre', '', false,
                                     { CLASS: 'code javascript doctest' }));
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    depart_doctest_block(node: INode) {
        this.body.push('\n</pre>\n');
    }

    /* eslint-disable-next-line camelcase */
    visit_document(node: INode) {
        const title = ((node.attributes.title || '') || basename(node.attributes.source) || 'docutils document without title');
        this.head.push(`<title>${this.encode(title)}</title>\n`);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    depart_document(node: INode) {
        this.headPrefix.push(this.doctype);
    }

    /*
      this.headPrefixTemplate %
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
    */
    /* eslint-disable-next-line camelcase */
    visit_emphasis(node: INode) {
        this.body.push(this.starttag(node, 'em', ''));
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    depart_emphasis(node: INode) {
        this.body.push('</em>');
    }

    /* eslint-disable-next-line camelcase */
    visit_entry(node: INode) {
        const atts: any = { class: [] };
        if (node.parent!.parent instanceof nodes.thead) {
            atts.class.push('head');
        }
        const ggParent = node.parent!.parent!.parent!;
        let stubs: any[] = ggParent.getCustomAttr('stubs');
        if(stubs[node.parent!.getCustomAttr('column')]) {
           // "stubs" list is an attribute of the tgroup element
            atts.class.push('stub');
        }
        let tagname;
        if (atts.class.length) {
            tagname = 'th';
            atts.class = (atts.class.join(' '));
        } else {
            tagname = 'td';
            delete atts.class;
        }

        // @ts-ignore
        node.parent!.column += 1;
        if ('morerows' in node.attributes) {
            atts.rowspan = node.attributes.morerows + 1;
        }
        if ('morecols' in node.attributes) {
            atts.colspan = node.attributes.morecols + 1;
            (<row>node.parent!).column += node.attributes.morecols;
        }
        this.body.push(this.starttag(node, tagname, '', false, atts));
        this.context.push(`</${tagname.toLowerCase()}>\n`);
        // TODO: why does the html4css1 writer insert an NBSP into empty cells?
        // if len(node: INode) == 0:              // empty cell
        //     this.body.push('&//0160;') // no-break space
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    depart_entry(node: INode) {
        this.body.push(this.context.pop()!);
    }

    /* eslint-disable-next-line camelcase */
    /*
      visit_enumerated_list(node: INode) {
      atts = {}
      if 'start' in node:
      atts['start'] = node.attributes['start']
      if 'enumtype' in node:
      atts['class'] = node.attributes['enumtype']
      if this.isCompactable(node: INode):
      atts['class'] = (atts.get('class', '') + ' simple').strip()
      this.body.push(this.starttag(node, 'ol', **atts))
      }

      depart_enumerated_list(node: INode) {
      this.body.push('</ol>\n')
      }
    */
    /* eslint-disable-next-line camelcase */
    visit_field_list(node: INode) {
        // Keep simple paragraphs in the field_body to enable CSS
        // rule to start body on new line if the label is too long
        let classes = 'field-list';
        if (this.isCompactable(node)) {
            classes += ' simple';
        }
        this.body.push(this.starttag(node, 'dl', '\n', false, { CLASS: classes }));
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    depart_field_list(node: INode) {
        this.body.push('</dl>\n');
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    visit_field(node: INode) {
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    depart_field(node: INode) {
    }

    // as field is ignored, pass class arguments to field-name and field-body:

    /* eslint-disable-next-line camelcase */
    visit_field_name(node: INode) {
        this.body.push(this.starttag(node, 'dt', '', false,
                                     { CLASS: node.parent!.attributes.classes.join(' ') }));
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    depart_field_name(node: INode) {
        this.body.push('</dt>\n');
    }

    /* eslint-disable-next-line camelcase */
    visit_field_body(node: INode) {
        this.body.push(this.starttag(node, 'dd', '', false,
                                     { CLASS: node.parent!.attributes.classes.join(' ') }));

        // prevent misalignment of following content if the field is empty:
        if (!node.children.length) {
            this.body.push('<p></p>');
        }
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    depart_field_body(node: INode) {
        this.body.push('</dd>\n');
    }

    /* eslint-disable-next-line camelcase */
    /*
      visit_figure(node: INode) {
      atts = {'class': 'figure'}
      if node.get('width'):
      atts['style'] = 'width: %s' % node.attributes['width']
      if node.get('align'):
      atts['class'] += " align-" + node.attributes['align']
      this.body.push(this.starttag(node, 'div', **atts))
      }

      depart_figure(node: INode) {
      this.body.push('</div>\n')
      }

      // use HTML 5 <footer> element?
      visit_footer(node: INode) {
      this.context.push(len(this.body))
      }

      depart_footer(node: INode) {
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
    /* eslint-disable-next-line camelcase,no-unused-vars */
    visit_footnote(node: INode) {
        if (!this.inFootnoteList) {
            const classes = `footnote ${this.settings.docutilsWritersHtml4Css1Writer!.footnoteReferences}`;
            this.body.push(`<dl class="${classes}">\n`);
            this.inFootnoteList = true;
        }
    }

    /* eslint-disable-next-line camelcase */
    depart_footnote(node: INode) {
        this.body.push('</dd>\n');
        if (!(node.nextNode({ descend: false, siblings: true}) instanceof nodes.footnote)) {
            this.body.push('</dl>\n');
            this.inFootnoteList = false;
        }
    }

    /* whoops this requires references transform!! */
    /* eslint-disable-next-line camelcase */
    visit_footnote_reference(node: INode) {
        if (!node.attributes.refid) {
            /* eslint-disable-next-line no-console */
            console.log('warning, no refid ( implement transforms )');
        }
        const href = `#${node.attributes.refid || ''}`;
        const classes = `footnote-reference ${this.settings.docutilsWritersHtml4Css1Writer!.footnoteReferences}`;
        this.body.push(this.starttag(node, 'a', '', // suffix,
                                     false,
                                     { CLASS: classes, href }));
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    depart_footnote_reference(node: INode) {
        this.body.push('</a>');
    }

    // Docutils-generated text: put section numbers in a span for CSS styling:
    /* eslint-disable-next-line camelcase,no-unused-vars */
    visit_generated(node: INode) {
        /* generating error */
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    depart_generated(node: INode) {
    }

/*
          visit_header(node: INode) {
          this.context.push(len(this.body))
          }

          depart_header(node: INode) {
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

          visit_image(node: INode) {
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

          depart_image(node: INode) {
          // this.body.push(this.context.pop())
          }
          pass

          visit_inline(node: INode) {
          this.body.push(this.starttag(node, 'span', ''))
          }

          depart_inline(node: INode) {
          this.body.push('</span>')
          }
    */
    // footnote and citation labels:
    /* eslint-disable-next-line camelcase */
    visit_label(node: INode) {
        let classes;
        if (node.parent instanceof nodes.footnote) {
            classes = this.settings.docutilsWritersHtml4Css1Writer!.footnoteReferences;
        } else {
            classes = 'brackets';
        }
        // pass parent node to get id into starttag:
        this.body.push(this.starttag(node.parent!, 'dt', '', false, { CLASS: 'label' }));
        this.body.push(this.starttag(node, 'span', '', false, { CLASS: classes }));
        // footnote/citation backrefs:
        if (this.settings.docutilsCoreOptionParser!.footnoteBacklinks) {
            const backrefs = node.parent!.attributes.backrefs;
            if (backrefs.length === 1) {
                this.body.push(`<a class="fn-backref" href="//${backrefs[0]}">`);
            }
        }
    }

    /* eslint-disable-next-line camelcase */
    depart_label(node: INode) {
        let backrefs = [];
        if (this.settings.docutilsCoreOptionParser!.footnoteBacklinks) {
            backrefs = node.parent!.attributes.backrefs;
            if (backrefs.length === 1) {
                this.body.push('</a>');
            }
        }
        this.body.push('</span>');
        if (this.settings.docutilsCoreOptionParser!.footnoteBacklinks && backrefs.length > 1) {
            const backlinks = backrefs.map((ref: string, i: number) => `<a href="//${ref}">${i + 1}</a>`);
            this.body.push(`<span class="fn-backref">(${backlinks.join(',')})</span>`);
        }
        this.body.push('</dt>\n<dd>');
    }

    /*
      visit_legend(node: INode) {
      this.body.push(this.starttag(node, 'div', { CLASS: 'legend' }))
      }

      depart_legend(node: INode) {
      this.body.push('</div>\n')
      }

      visit_line(node: INode) {
      this.body.push(this.starttag(node, 'div', suffix='', { CLASS: 'line' }))
      if not len(node: INode):
      this.body.push('<br />')
      }

      depart_line(node: INode) {
      this.body.push('</div>\n')
      }

      visit_line_block(node: INode) {
      this.body.push(this.starttag(node, 'div', { CLASS: 'line-block' }))
      }

      depart_line_block(node: INode) {
      this.body.push('</div>\n')
      }

      visit_list_item(node: INode) {
      this.body.push(this.starttag(node, 'li', ''))
      }

      depart_list_item(node: INode) {
      this.body.push('</li>\n')
      }
    */
    // inline literal
    /* eslint-disable-next-line camelcase */
    visit_literal(node: INode) {
        // special case: "code" role
        const classes = node.attributes.classes || [];
        if (classes.indexOf('code') !== -1) {
            // filter 'code' from class arguments
            // fixme //node.attributes['classes'] = [cls for cls in classes if cls != 'code']
            return this.body.push(this.starttag(node, 'span', '', false, { CLASS: 'docutils literal' }));
        }
        /* eslint-disable-next-line no-unused-vars */
        let text = node.astext();
        // remove hard line breaks (except if in a parsed-literal block)
        if (!(node.parent instanceof nodes.literal_block)) {
            text = text.replace('\n', ' ');
        }
        // Protect text like ``--an-option`` and the regular expression
        // ``[+]?(\d+(\.\d*)?|\.\d+)`` from bad line wrapping
        /* fixme
           this.wordsAndSpaces.findall(text).forEach((token) => {
           if (token.trim() && this.inWordWrapPoint.search(token)) {
           this.body.push(`<span class="pre">${this.encode(token)}</span>`);
           } else {
           this.body.push(this.encode(token));
           }
           });
        */
        this.body.push('</span>');
        // Content already processed:
        throw new nodes.SkipNode();
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    depart_literal(node: INode) {
        // skipped unless literal element is from "code" role:
        this.body.push('</code>');
    }

    /* eslint-disable-next-line camelcase */
    visit_literal_block(node: INode) {
        this.body.push(this.starttag(node, 'pre', '', false, { CLASS: 'literal-block' }));
        if ((node.attributes.classes || []).indexOf('code') !== -1) {
            this.body.push('<code>');
        }
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    depart_literal_block(node: INode) {
        if ((node.attributes.classes || []).indexOf('code') !== -1) {
            this.body.push('</code>');
        }
        this.body.push('</pre>\n');

        // Mathematics:
        // As there is no native HTML math support, we provide alternatives
        // for the math-output: LaTeX and MathJax simply wrap the content,
        // HTML and MathML also convert the math_code.
        // HTML container
        /* eslint-disable-next-line no-unused-vars */
        const mathTags = {// math_output: (block, inline, class-arguments)
            mathml: ['div', '', ''],
            html: ['div', 'span', 'formula'],
            mathjax: ['div', 'span', 'math'],
            latex: ['pre', 'tt', 'math'],
        };
    }

    /* eslint-disable-next-line camelcase */
    /*
      visit_math(node, math_env='') {
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

      depart_math(node: INode) {
      }
      pass // never reached

      visit_math_block(node: INode) {
      // print node.astext().encode('utf8')
      math_env = pick_math_environment(node.astext())
      this.visit_math(node, math_env=math_env)
      }

      depart_math_block(node: INode) {
      }
      pass // never reached

      // Meta tags: 'lang' attribute replaced by 'xml:lang' in XHTML 1.1
      // HTML5/polyglot recommends using both
      visit_meta(node: INode) {
      meta = this.emptytag(node, 'meta', **node.non_default_attributes())
      this.add_meta(meta)
      }

      depart_meta(node: INode) {
      }
      pass

      add_meta( tag) {
      this.meta.push(tag)
      this.head.push(tag)
      }

      visit_option(node: INode) {
      this.body.push(this.starttag(node, 'span', '', { CLASS: 'option' }))
      }

      depart_option(node: INode) {
      this.body.push('</span>')
      if isinstance(node.next_node(descend=false, siblings=true),
      nodes.option):
      this.body.push(', ')
      }

      visit_option_argument(node: INode) {
      this.body.push(node.get('delimiter', ' '))
      this.body.push(this.starttag(node, 'var', ''))
      }

      depart_option_argument(node: INode) {
      this.body.push('</var>')
      }

      visit_option_group(node: INode) {
      this.body.push(this.starttag(node, 'dt', ''))
      this.body.push('<kbd>')
      }

      depart_option_group(node: INode) {
      this.body.push('</kbd></dt>\n')
      }

      visit_option_list(node: INode) {
      this.body.push(
      this.starttag(node, 'dl', { CLASS: 'option-list' }))
      }

      depart_option_list(node: INode) {
      this.body.push('</dl>\n')
      }

      visit_option_list_item(node: INode) {
      }

      depart_option_list_item(node: INode) {
      }

      visit_option_string(node: INode) {
      }

      depart_option_string(node: INode) {
      }

      visit_organization(node: INode) {
      this.visitDocinfoItem(node, 'organization')
      }

      depart_organization(node: INode) {
      this.departDocinfoItem()

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

      visit_paragraph(node: INode) {
      this.body.push(this.starttag(node, 'p', ''))
      }

      depart_paragraph(node: INode) {
      this.body.push('</p>')
      if not (isinstance(node.parent, (nodes.list_item, nodes.entry)) and
      (len(node.parent) == 1)):
      this.body.push('\n')
      }
    */
    /* eslint-disable-next-line camelcase */
    visit_problematic(node: INode) {
        if (typeof node.attributes.refid !== 'undefined') {
            this.body.push(`<a href="//${node.attributes.refid}">`);
            this.context.push('</a>');
        } else {
            this.context.push('');
            this.body.push(this.starttag(node, 'span', '', false, { CLASS: 'problematic' }));
        }
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    depart_problematic(node: INode) {
        this.body.push('</span>');
        this.body.push(this.context.pop()!);
    }

    /*
      visit_raw(node: INode) {
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
    /* eslint-disable-next-line camelcase */
    visit_reference(node: INode) {
        const atts: any = { class: 'reference' };
        if ('refuri' in node.attributes) {
            atts.href = node.attributes.refuri;
            if (this.settings.docutilsWritersHtml4Css1Writer!.cloakEmailAddresses
                && atts.href.substring(0, 6) === 'mailto:') {
                atts.href = this.cloakMailto(atts.href);
                this.inMailto = true;
            }
            atts.class += ' external';
        } else {
            // assert 'refid' in node, \ 'References must have "refuri" or "refid" attribute.'
            atts.href = `#${node.attributes.refid}`;
            atts.class += ' internal';
        }

        if (!(node.parent instanceof nodes.TextElement)) {
            // assert len(node: INode) == 1 and isinstance(node.attributes[0], nodes.image)
            atts.class += ' image-reference';
        }
        this.body.push(this.starttag(node, 'a', '', false, atts));
    }

    /* eslint-disable-next-line camelcase */
    depart_reference(node: INode) {
        this.body.push('</a>');
        if (!(node.parent instanceof nodes.TextElement)) {
            this.body.push('\n');
        }
        this.inMailto = false;
    }

    /*
      visit_revision(node: INode) {
      this.visitDocinfoItem(node, 'revision', meta=false)
      }

      depart_revision(node: INode) {
      this.departDocinfoItem()
      }
    */
    /* eslint-disable-next-line camelcase */
    visit_row(node: row) {
        this.body.push(this.starttag(node, 'tr', ''));
        node.column = 0;
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    depart_row(node: INode) {
        this.body.push('</tr>\n');
    }

    /*
      visit_rubric(node: INode) {
      this.body.push(this.starttag(node, 'p', '', { CLASS: 'rubric' }))
      }

      depart_rubric(node: INode) {
      this.body.push('</p>\n')
      }

      // TODO: use the new HTML 5 element <section>?
      visit_section(node: INode) {
      this.section_level += 1
      this.body.push(
      this.starttag(node, 'div', { CLASS: 'section' }))
      }

      depart_section(node: INode) {
      this.section_level -= 1
      this.body.push('</div>\n')

      // TODO: use the new HTML5 element <aside>? (Also for footnote text)
      }
      visit_sidebar(node: INode) {
      this.body.push(
      this.starttag(node, 'div', { CLASS: 'sidebar' }))
      this.in_sidebar = true
      }

      depart_sidebar(node: INode) {
      this.body.push('</div>\n')
      this.in_sidebar = false
      }

      visit_status(node: INode) {
      this.visitDocinfoItem(node, 'status', meta=false)
      }

      depart_status(node: INode) {
      this.departDocinfoItem()
      }

    */
    /* eslint-disable-next-line camelcase */
    visit_strong(node: INode) {
        this.body.push(this.starttag(node, 'strong', ''));
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    depart_strong(node: INode) {
        this.body.push('</strong>');
    }

    /*
      visit_subscript(node: INode) {
      this.body.push(this.starttag(node, 'sub', ''))
      }

      depart_subscript(node: INode) {
      this.body.push('</sub>')
      }
*/

    /** Internal only. */
    /* eslint-disable-next-line camelcase,no-unused-vars */
    visit_substitution_definition(node: INode) {
        throw new nodes.SkipNode();
    }

/*
      visit_substitution_reference(node: INode) {
      this.unimplemented_visit(node: INode)
      }

      // h1 h6 elements must not be used to markup subheadings, subtitles,
      // alternative titles and taglines unless intended to be the heading for a
      // new section or subsection.
      // -- http://www.w3.org/TR/html/sections.html//headings-and-sections
      visit_subtitle(node: INode) {
      if isinstance(node.parent, nodes.sidebar):
      classes = 'sidebar-subtitle'
      elif isinstance(node.parent, nodes.document):
      classes = 'subtitle'
      this.in_document_title = len(this.body)+1
      elif isinstance(node.parent, nodes.section):
      classes = 'section-subtitle'
      this.body.push(this.starttag(node, 'p', '', CLASS=classes))
      }

      depart_subtitle(node: INode) {
      this.body.push('</p>\n')
      if isinstance(node.parent, nodes.document):
      this.subtitle = this.body[this.in_document_title:-1]
      this.in_document_title = 0
      this.body_pre_docinfo.extend(this.body)
      this.html_subtitle.extend(this.body)
      del this.body[:]
      }

      visit_superscript(node: INode) {
      this.body.push(this.starttag(node, 'sup', ''))
      }

      depart_superscript(node: INode) {
      this.body.push('</sup>')
      }

    */
    /* eslint-disable-next-line camelcase */
    visit_system_message(node: INode) {
        this.body.push(this.starttag(node, 'div', '\n', false, { CLASS: 'system-message' }));
        this.body.push('<p class="system-message-title">');
        let backrefText = '';
        if (node.attributes.backrefs.length) {
            const backrefs = node.attributes.backrefs;
            if (backrefs.length === 1) {
                backrefText = `; <em><a href="//${backrefs[0]}">backlink</a></em>`;
            } else {
                const backlinks = backrefs.map((backref: string, i: number) => `<a href="//${backref}">${i + 1}</a>`);
                backrefText = `; <em>backlinks: ${backlinks.join(', ')}</em>`;
            }
        }
        let line;
        if (node.attributes.line != null) {
            line = `, line ${node.attributes.line}`;
        } else {
            line = '';
        }
        this.body.push(`System Message: ${node.attributes.type}/${node.attributes.level} (<span class="docutils literal">${this.encode(node.attributes.source)}</span>${line})${backrefText}</p>\n`);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    depart_system_message(node: INode) {
        this.body.push('</div>\n');
    }

    /* eslint-disable-next-line camelcase */
    visit_table(node: INode) {
        const atts: any = {};
        const classes = this.settings.docutilsWritersHtml4Css1Writer!.tableStyle.split(',').map((cls: string) => cls.replace(/^[ \t\n]*/, '').replace(/[ \t\n]$/, ''));
        if ('align' in node.attributes) {
            classes.push(`align-${node.attributes.align}`);
        }
        if ('width' in node.attributes) {
            atts.style = `width: ${node.attributes.width}`;
        }
        const tag = this.starttag(node, 'table', '\n', false, { CLASS: classes.join(' '), ...atts });
        this.body.push(tag);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    depart_table(node: INode) {
        this.body.push('</table>\n');
    }

    /*
      visit_target(node: INode) {
      if not ('refuri' in node or 'refid' in node
      or 'refname' in node):
      this.body.push(this.starttag(node, 'span', '', { CLASS: 'target' }))
      this.context.push('</span>')
      else:
      this.context.push('')
      }

      depart_target(node: INode) {
      this.body.push(this.context.pop())
      }

    */
    // no hard-coded vertical alignment in table body
    /* eslint-disable-next-line camelcase */
    visit_tbody(node: INode) {
        this.body.push(this.starttag(node, 'tbody'));
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    depart_tbody(node: INode) {
        this.body.push('</tbody>\n');
    }

    /* eslint-disable-next-line camelcase */
    visit_term(node: INode) {
        this.body.push(this.starttag(node, 'dt', ''));
    }

    /**
     * Leave the end tag to `this.visit_definition()`, in case there's a classifier.
     */
    /* eslint-disable-next-line camelcase,no-unused-vars */
    depart_term(node: INode) {
    }

    /* eslint-disable-next-line camelcase */
    visit_tgroup(node: tgroup) {
        this.colspecs = [];
        node.stubs = [];
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    depart_tgroup(node: INode) {
    }

    /* eslint-disable-next-line camelcase */
    visit_thead(node: INode) {
        this.body.push(this.starttag(node, 'thead'));
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    depart_thead(node: INode) {
        this.body.push('</thead>\n');
    }

    /* eslint-disable-next-line camelcase */
    visit_title_reference(node: INode) {
        this.body.push(this.starttag(node, 'cite', ''));
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    depart_title_reference(node: INode) {
        this.body.push('</cite>');

        // TODO: use the new HTML5 element <aside>? (Also for footnote text)
    }

    /* eslint-disable-next-line camelcase */
    visit_topic(node: INode) {
        this.body.push(this.starttag(node, 'div', '\n', false, { CLASS: 'topic' }));
        this.topic.classes = node.attributes.classes;
    }
    // TODO: replace with ::
    //   this.in_contents = 'contents' in node.attributes['classes']

    /* eslint-disable-next-line camelcase,no-unused-vars */
    depart_topic(node: INode) {
        this.body.push('</div>\n');
        this.topicClasses = [];
        // TODO this.in_contents = false
    }

    /* eslint-disable-next-line camelcase */
    visit_transition(node: INode) {
        this.body.push(this.emptytag(node, 'hr', '\n', { CLASS: 'docutils' }));
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    depart_transition(node: INode) {
    }

    /* eslint-disable-next-line camelcase */
    visit_version(node: INode) {
        this.visitDocinfoItem(node, 'version', false);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    depart_version(node: INode) {
        this.departDocinfoItem();
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    unimplemented_visit(node: INode) {
        throw new UnimplementedError(`visiting unimplemented node type: ${node.tagname}`);
    }

    /* eslint-disable-next-line camelcase */
    visit_title(node: INode) {
        // Only 6 section levels are supported by HTML.
        /* eslint-disable-next-line no-unused-vars */
        const checkId = 0; // TODO: is this a bool (false) or a counter?
        let closeTag = '</p>\n';
        if (node.parent instanceof nodes.topic) {
            this.body.push(
                this.starttag(node, 'p', '', false, { CLASS: 'topic-title first' }),
            );
        } else if (node.parent instanceof nodes.sidebar) {
            this.body.push(
                this.starttag(node, 'p', '',false, { CLASS: 'sidebar-title' }),
            );
        } else if (node.parent!.isAdmonition()) {
            this.body.push(
                this.starttag(node, 'p', '', false, { CLASS: 'admonition-title' }),
            );
        } else if (node.parent instanceof nodes.table) {
            this.body.push(
                this.starttag(node, 'caption', ''),
            );
            closeTag = '</caption>\n';
        } else if (node.parent instanceof nodes.document) {
            this.body.push(this.starttag(node, 'h1', '', false, { CLASS: 'title' }));
            closeTag = '</h1>\n';
            this.inDocumentTitle = this.body.length;
        } else {
            // assert isinstance(node.parent, nodes.section)
            const headerLevel = this.sectionLevel + this.initialHeaderLevel - 1;
            let atts: any = {};
            if (node.parent!.children.length >= 2
                && node.parent!.children[1] instanceof nodes.subtitle) {
                atts.CLASS = 'with-subtitle';
            }
            this.body.push(
                this.starttag(node, `h${headerLevel}`, '', false, atts),
            );
            atts = {};
            if (Object.prototype.hasOwnProperty.call(node, 'refid')) {
                atts.class = 'toc-backref';
                atts.href = `#${node.refid}`;
            }
            if (Object.keys(atts).length) {
                this.body.push(this.starttag(node, 'a', '', false, atts));
                closeTag = `</a></h${headerLevel}>\n`;
            } else {
                closeTag = `</h${headerLevel}>\n`;
            }
        }
        this.context.push(closeTag);
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    depart_title(node: INode) {
        this.body.push(this.context.pop()!);
        if (this.inDocumentTitle) {
            this.title = this.body.slice(this.inDocumentTitle, this.body.length - 2);
            this.inDocumentTitle = 0;
            this.bodyPreDocinfo.push(...this.body);
            this.htmlTitle.push(...this.body);
            this.body.length = 0;
        }
    }

    /* eslint-disable-next-line camelcase */
    visit_bullet_list(node: INode) {
        const atts: any = {};
        const oldCompactSimple = this.compactSimple;
        this.compactParagraph = undefined;
        this.compactSimple = this.isCompactable(node);
        if (this.compactSimple && !oldCompactSimple) {
            atts.class = 'simple';
        }
        this.body.push(this.starttag(node, 'ul', '', false, atts));
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    depart_bullet_list(node: INode) {
        this.compactSimple = this.context.pop()!.length > 0;
        this.compactParagraph = this.compactSimple;
        this.body.push('</ul>\n');
    }

    /* eslint-disable-next-line camelcase */
    visit_list_item(node: INode) {
        this.body.push(this.starttag(node, 'li', ''));
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    depart_list_item(node: INode) {
        this.body.push('</li>\n');
    }

    /* eslint-disable-next-line camelcase */
    visit_paragraph(node: INode) {
        this.body.push(this.starttag(node, 'p', ''));
    }

    /* eslint-disable-next-line camelcase */
    depart_paragraph(node: INode) {
        this.body.push('</p>');
        if (!((node.parent instanceof nodes.list_item
               || node.parent instanceof nodes.entry)
              && node.parent!.children.length === 1)) {
            this.body.push('\n');
        }
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    passNode(node: INode) {
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    ignoreNode(node: INode) {
        throw new nodes.SkipNode();
    }

    private cloakMailto(href: any) {

    }

    private addMeta(metaTag: string) {

    }

    private checkSimpleList(node: any): boolean {
        //fixme
    //     """Check for a simple list that can be rendered compactly."""
    //     visitor = SimpleListChecker(self.document)
    //     try:
    //     node.walk(visitor)
    //     except nodes.NodeFound:
    //     return False
    // else:
    //     return True

        return false;
    }

    private cloakEmail(encoded: string): string {
        return encoded;

    }
}

/**
 * Class for writing HTML
 */
class HTMLBaseWriter extends BaseWriter {
    private visitorAttributes: any[] = [];
    private defaultTemplateContent: any;
    private visitor: any;
    private attr: any;
    private translatorClass: any;
    private template: any;
    /**
     * Create HTMLBaseWriter.
     * @param {Object} args - arguments to function
     */
    constructor() {
        super();
        this.attr = {};
        this.translatorClass = HTMLTranslator;
    }

    _init() {
        super._init();
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
        if (!visitor) {
            throw new Error();
        }
        this.document!.walkabout(visitor);
        this.visitorAttributes.forEach((attr) => {
            // @ts-ignore
            this[attr] = visitor[attr];
        });
        this.output = visitor.body.join('');// this.applyTemplate();
        //        console.log(this.output);
    }

    applyTemplate() {
        /* eslint-disable-next-line no-unused-vars */
        const templateContent = this.defaultTemplateContent;
        /*        template_file = open(this.document.settings.template, 'rb')
                  template = unicode(template_file.read(), 'utf-8')
                  template_file.close()
                  subs = this.interpolation_dict()
                  return template % subs
        */
        return template(this.templateVars());
    }

    templateVars() {
        const vars: any = {};
        const settings = this.document!.settings;
        // @ts-ignore
        const x = Object.prototype.getOwnPropertyDescriptor.call(this, "test").value;
        console.log(x);
        this.visitorAttributes.forEach((attr) => {
            // @ts-ignore
            vars[attr] = (this[attr] || [].join('').trim());
        });
        vars.encoding = settings.docutilsFrontendOptionParser!.outputEncoding;
        vars.version = __version__;
        return vars;
    }

    assembleParts() {
        super.assembleParts();
        this.visitorAttributes.forEach((part) => {
            // @ts-ignore
            this.parts[part] = (this[part] || []).join('');
        });
    }
}

/**
 *  Raise `nodes.NodeFound` if non-simple list item is encountered.
 *
 *      Here "simple" means a list item containing nothing other than a single
 *  paragraph, a simple list, or a paragraph followed by a simple list.
 *
 *      This version also checks for simple field lists and docinfo.
 */
class SimpleListChecker extends nodes.GenericNodeVisitor {
    default_visit(node: INode) {
        super.default_visit(node);
    }

    default_departure(node: INode) {
        super.default_departure(node);
    }
}
// def default_visit(self, node):
// raise nodes.NodeFound
//
// def visit_list_item(self, node):
// # print "visiting list item", node.__class__
// children = [child for child in node.children
//     if not isinstance(child, nodes.Invisible)]
// # print "has %s visible children" % len(children)
// if (children and isinstance(children[0], nodes.paragraph)
// and (isinstance(children[-1], nodes.bullet_list) or
// isinstance(children[-1], nodes.enumerated_list) or
// isinstance(children[-1], nodes.field_list))):
// children.pop()
// # print "%s children remain" % len(children)
// if len(children) <= 1:
// return
// else:
// # print "found", child.__class__, "in", node.__class__
// raise nodes.NodeFound
//
// def pass_node(self, node):
// pass
//
// def ignore_node(self, node):
// # ignore nodes that are never complex (can contain only inline nodes)
// raise nodes.SkipNode
//
// # Paragraphs and text
// visit_Text = ignore_node
// visit_paragraph = ignore_node
//
// # Lists
// visit_bullet_list = pass_node
// visit_enumerated_list = pass_node
// visit_docinfo = pass_node
//
// # Docinfo nodes:
//     visit_author = ignore_node
// visit_authors = visit_list_item
// visit_address = visit_list_item
// visit_contact = pass_node
// visit_copyright = ignore_node
// visit_date = ignore_node
// visit_organization = ignore_node
// visit_status = ignore_node
// visit_version = visit_list_item
//
// # Definition list:
//     visit_definition_list = pass_node
// visit_definition_list_item = pass_node
// visit_term = ignore_node
// visit_classifier = pass_node
// visit_definition = visit_list_item
//
// # Field list:
//     visit_field_list = pass_node
// visit_field = pass_node
// # the field body corresponds to a list item
// visit_field_body = visit_list_item
// visit_field_name = ignore_node
//
// # Invisible nodes should be ignored.
//     visit_comment = ignore_node
// visit_substitution_definition = ignore_node
// visit_target = ignore_node

export default HTMLBaseWriter;
