import xmlescape from 'xml-escape';
import Transformer from './Transformer';
import { InvalidArgumentsError } from './Exceptions';
import unescape from './utils/unescape';
import { isIterable } from './utils';

function dupname(node, name) {
    node.attributes.dupnames.push(name);
    node.attributes.names.splice(node.attributes.names.indexOf(name), 1);
    // Assume that this method is referenced, even though it isn't; we
    // don't want to throw unnecessary system_messages.
    node.referenced = 1;
}
function serialEscape(value) {
    // """Escape string values that are elements of a list, for serialization."""
    return value.replace(/\\/g, '\\\\').replace(/ /g, '\\ ');
}

function pseudoQuoteattr(value) {
    return `"${xmlescape(value)}"`;
}

export function whitespaceNormalizeName(name) {
// """Return a whitespace-normalized name."""
    return name.replace(/\s+/, ' ');
}

export function fullyNormalizeName(name) {
    return name.toLowerCase().replace(/\s+/, ' ');
}

function setupBacklinkable(o) {
    o.addBackref = refid => o.attributes.backrefs.push(refid);
}
function makeId(string) {
    return string;
    /*    id = string.lower()
    if not isinstance(id, str):
        id = id.decode()
    id = id.translate(_non_id_translate_digraphs)
    id = id.translate(_non_id_translate)
    # get rid of non-ascii characters.
    # 'ascii' lowercase to prevent problems with turkish locale.
    id = unicodedata.normalize('NFKD', id).\
         encode('ascii', 'ignore').decode('ascii')
    # shrink runs of whitespace and replace by hyphen
    id = _non_id_chars.sub('-', ' '.join(id.split()))
    id = _non_id_at_ends.sub('', id)
    return str(id)
*/
}

function _callDefaultVisit(node) {
    return this.default_visit(node);
}

function _callDefaultDeparture(node) {
    return this.default_departure(node);
}

const nodeClassNames = ['Text', 'abbreviation', 'acronym', 'address', 'admonition', 'attention', 'attribution', 'author', 'authors', 'block_quote', 'bullet_list', 'caption', 'caution', 'citation', 'citation_reference', 'classifier', 'colspec', 'comment', 'compound', 'contact', 'container', 'copyright', 'danger', 'date', 'decoration', 'definition', 'definition_list', 'definition_list_item', 'description', 'docinfo', 'doctest_block', 'document', 'emphasis', 'entry', 'enumerated_list', 'error', 'field', 'field_body', 'field_list', 'field_name', 'figure', 'footer', 'footnote', 'footnote_reference', 'generated', 'header', 'hint', 'image', 'important', 'inline', 'label', 'legend', 'line', 'line_block', 'list_item', 'literal', 'literal_block', 'math', 'math_block', 'note', 'option', 'option_argument', 'option_group', 'option_list', 'option_list_item', 'option_string', 'organization', 'paragraph', 'pending', 'problematic', 'raw', 'reference', 'revision', 'row', 'rubric', 'section', 'sidebar', 'status', 'strong', 'subscript', 'substitution_definition', 'substitution_reference', 'subtitle', 'superscript', 'system_message', 'table', 'target', 'tbody', 'term', 'tgroup', 'thead', 'tip', 'title', 'title_reference', 'topic', 'transition', 'version', 'warning'];

const SkipChildren = class {};
const StopTraversal = class {};
const SkipNode = class {};
const SkipDeparture = class {};
const SkipSiblings = class {};

export class NodeVisitor {
    constructor(document) {
        this.document = document;
        this.optional = [];
    }

    dispatchVisit(node) {
        const nodeName = node.tagname;
        const methodName = `visit_${nodeName}`;
//      console.log(`visiting ${nodeName}`);
        let method = this[methodName];
        if (!method) {
//            console.log('selecting unknown visit');
            method = this.unknownVisit;
        }
        this.document.reporter.debug(`docutils.nodes.NodeVisitor.dispatch_visit calling for ${nodeName}`);
        return method.bind(this)(node);
    }

    dispatchDeparture(node) {
        const nodeName = node.tagname;
        const method = this[`depart_${nodeName}`] || this.unknownDeparture;
        this.document.reporter.debug(
            `docutils.nodes.NodeVisitor.dispatch_departure calling for ${node}`,
);
        return method.bind(this)(node);
    }

    unknownVisit(node) {
        if (this.document.settings.strictVisitor || !(this.optional.includes(node.tagname))) {
//            console.log('throwing error');
            throw new Error(`visiting unknown node type:${node.tagname}`);
        }
    }

    unknownDeparture(node) {
        if (this.document.settings.strictVisitor || !(this.optional.includes(node.tagname))) {
            throw new Error(`departing unknown node type: ${node.tagname}`);
        }
    }
}

export class Node {
    constructor() {
        this.tagname = this.constructor.name;
        this.parent = undefined;
        this.document = undefined;
        this.source = undefined;
        this.line = undefined;
        this._init();
    }

    _init() {
    }

    asdom() {
    }

    pformat() {
    }

    copy() {
    }

    deepcopy() {
    }

    setupChild() {
    }

    walk() {
        throw new Error('unimplemented');
    }

    walkabout(visitor) {
        let callDepart = true;
        let stop = false;
        visitor.document.reporter.debug('docutils.nodes.Node.walkabout calling dispatch_visit');
        try {
            try {
                visitor.dispatchVisit(this);
            } catch (error) {
                if (error instanceof SkipNode || error instanceof SkipChildren) {
                    return stop;
                } if (error instanceof SkipDeparture) {
                    callDepart = false;
                } else {
                    throw error;
                }
            }

            const children = this.children;
            try {
                /* eslint-disable-next-line no-restricted-syntax */
                for (const child of [...children]) {
                    //                  console.log(typeof child);
                    //                  console.log(Object.keys(child));
                    if (child.walkabout(visitor)) {
                        stop = true;
                        break;
                    }
                }
            } catch (error) {
                if (!(error instanceof SkipSiblings)) {
                    throw error;
                }
            }
        } catch (error) {
            if (error instanceof StopTraversal) {
                stop = true;
            } else {
                throw error;
            }
        }
        if (callDepart) {
            visitor.document.reporter.debug(
                `docutils.nodes.Node.walkabout calling dispatch_departure for ${this}`,
            );
            visitor.dispatchDeparture(this);
        }
        return stop;
    }

    traverse(condition, includeSelf = true, descend = true, siblings = false, ascend = false) {
        const mySiblings = ascend ? true : siblings;
        if (includeSelf && descend && !mySiblings) {
            if (!condition) {
                return this._allTraverse();
            } if (condition instanceof Node) {
                return this._fastTraverse(condition);
            }
        }
        if (condition instanceof Node) {
            const nodeClass = condition;
            /* eslint-disable-next-line no-unused-vars */
            const myCondition = (node, nodeClassArg) => node instanceof (nodeClassArg || nodeClass);
        }
        return [];
    }
}

/* This is designed to be called later, a-nd not with an object. hmm */
export function _addNodeClassNames(names, o) {
    names.forEach((_name) => {
        const v = `visit_${_name}`;
        if (!o[v]) {
            o[v] = _callDefaultVisit.bind(o);
        }
        const d = `depart_${_name}`;
        if (!o[d]) {
            o[d] = _callDefaultDeparture.bind(o);
        }
    });
}
export class GenericNodeVisitor extends NodeVisitor {
    constructor(document) {
        super(document);
        _addNodeClassNames(nodeClassNames, this);
    }

    /* eslint-disable-next-line */
    default_visit(node) {
        throw new Error('not implemented');
    }

    /* eslint-disable-next-line */
    default_departure(node) {
        throw new Error('not implemented');
    }
}
GenericNodeVisitor.nodeClassNames = nodeClassNames;


// mixin
export class Titular { }

export class Element extends Node {
    constructor(rawsource, children, attributes) {
        super();
        this.nodeName = Symbol.for('Element');
        this.children = [];
        if (children === undefined) {
            children = [];
        }
        this.extend(...children);
        this.attributes = { };
        this.listAttributes.forEach((x) => {
            this.attributes[x] = [];
        });
        if (typeof attributes === 'undefined') {
            attributes = {};
        }
        Object.entries(attributes).forEach(([att, value]) => {
            att = att.toLowerCase();
            /* This if path never taken... why? FIXME */
            if (att in this.listAttributes) {
                /* istanbul ignore next */
                if (!isIterable(value)) {
                    throw new Error();
                }
                this.attributes[att] = [...value];
            } else {
                this.attributes[att] = value;
            }
        });
    }

    toString() {
        if (this.children.length) {
            return [this.starttag(), ...this.children.map(c => c.toString()), this.endtag()].join('');
        }
        return this.emptytag();
    }

    emptytag() {
        return `<${[this.tagname, ...Object.entries(this.attlist()).map(([n, v]) => `${n}="${v}"`)].join(' ')}/>`;
    }

    _init() {
        super._init();
        this.childTextSeparator = '\n\n';
        this.basicAttributes = ['ids', 'classes', 'names', 'dupnames'];
        this.localAttributes = ['backrefs'];
        this.listAttributes = [...this.basicAttributes, ...this.localAttributes];
    }


    astext() {
        return this.children.map(x => x.astext()).join(this.childTextSeparator);
    }

    extend(...items) {
        items.forEach(this.append.bind(this));
    }

    append(item) {
        this.setupChild(item);
        this.children.push(item);
    }

    add(item, ...args) {
        /* istanbul ignore if */
        if (args.length !== 0) {
            throw new Error('');
        }
        if (Array.isArray(item)) {
            this.extend(...item);
        } else {
            this.append(item);
        }
    }


    setupChild(child) {
        /* istanbul ignore if */
        if (!(child instanceof Node)) {
            throw new InvalidArgumentsError(`Expecting node instance ${child}`);
        }

        /* istanbul ignore if */
        if (!child) {
            throw new InvalidArgumentsError();
        }

        child.parent = this;
        if (this.document) {
            child.document = this.documentl;
            if (typeof child.source === 'undefined') {
                child.source = this.document.currentSource;
            }
            if (typeof child.line === 'undefined') {
                child.line = this.document.currentLine;
            }
        }
    }

    starttag(quoteattr) {
        if (typeof quoteattr === 'undefined') {
            quoteattr = pseudoQuoteattr;
        }
        const parts = [this.tagname];
        const attlist = this.attlist();
        Object.entries(attlist).forEach(([name, value]) => {
            let myVal = value;
            let gotPart = false;
            if (myVal === undefined) {
                parts.push(`${name}="True"`);
                gotPart = true;
            } else if (Array.isArray(myVal)) {
                const values = myVal.map(v => serialEscape(v.toString()));
                myVal = values.join(' ');
            } else {
                myVal = value.toString();
            }
            if (!gotPart) {
                myVal = quoteattr(myVal);
                parts.push(`${name}=${myVal}`);
            }
        });
        return `<${parts.join(' ')}>`;
    }

    endtag() {
        return `</${this.tagname}>`;
    }

    attlist() {
        const attlist = this.nonDefaultAttributes();
        return attlist;
    }

    nonDefaultAttributes() {
        const atts = { };
        Object.entries(this.attributes).forEach(([key, value]) => {
            if (this.isNotDefault(key)) {
                atts[key] = value;
            }
        });
        return atts;
    }

    isNotDefault(key) {
        if (Array.isArray(this.attributes[key])
            && this.attributes[key].length === 0
            && this.listAttributes.includes(key)) {
            return false;
        }
        return true;
    }
}

export class Text extends Node {
    constructor(data, rawsource = '') {
        super();
        if (typeof data === 'undefined') {
            throw new Error('data should not be undefined');
        }

        this.rawsource = rawsource;
        this.data = data;
        this.children = [];
    }

    astext() {
        return unescape(this.data);
    }

    toString() {
        return this.astext();
    }

    toSource() {
        return this.toString();
    }
}

export class TextElement extends Element {
    constructor(rawsource, text, children, attributes) {
        if (!children) {
            children = [];
        }
        /* istanbul ignore if */
        if (Array.isArray(text)) {
            throw new InvalidArgumentsError('text should not be an array');
        }
        super(rawsource, (typeof text !== 'undefined' && text !== '') ? [new Text(text), ...children] : children, attributes);
    }
}

// =====================
//  Decorative Elements
// =====================
export class header extends Element { } // Decorative
export class footer extends Element { } // Decorative

export class decoration extends Element {
    getHeader() {
        if (!this.children.length || !(this.children[0] instanceof header)) {
            this.insert(0, new header());
        }
        return this.children[0];
    }

    getFooter() {
        if (!this.children.length || !(this.children[this.children.length - 1] instanceof footer)) {
            this.add(new footer());
        }
        return this.children[this.children.length - 1];
    }
}

export class document extends Element {
    constructor(settings, reporter, ...args) {
        super(...args);
        this.tagname = 'document';
        this.currentSource = undefined;
        this.currentLine = undefined;
        this.settings = settings;
        this.reporter = reporter;
        this.indirectTargets = [];
        this.substitutionDefs = {};
        this.substitutionNames = {};
        this.refNames = {};
        this.refIds = {};
        this.nameIds = {};
        this.nameTypes = {};
        this.ids = {};
        this.footnoteRefs = {};
        this.citatonRefs = {};
        this.autofootnotes = [];
        this.autofootnoteRefs = [];
        this.symbolFootnotes = [];
        this.symbolFootnoteRefs = [];
        this.footnotes = [];
        this.citations = [];
        this.autofootnoteStart = 1;
        this.symbolFootnoteStart = 0;
        this.idStart = 1;
        this.parseMesssages = [];
        this.transformMessages = [];
        this.transformer = new Transformer(this);
        this.decoration = undefined;
        this.document = this;
    }

    setId(node, msgnode) {
        let msg;
        let id;
        node.attributes.ids.forEach((myId) => {
            if (myId in this.ids && this.ids[myId] !== node) {
                msg = this.reporter.severe(`Duplicate ID: "${myId}".`);
                if (msgnode) {
                    msgnode.add(msg);
                }
            }
        });
        if (node.attributes.ids.length === 0) {
            let name;
            let myBreak = false;
            /* eslint-disable-next-line no-restricted-syntax */
            for (name of node.attributes.names) {
                id = this.settings.idPrefix + makeId(name);
                if (id && !(id in this.attributes.ids)) {
                    myBreak = true;
                    break;
                }
            }
            if (!myBreak) {
                id = '';
                while (!id || (id in this.attributes.ids)) {
                    id = (this.settings.idPrefix + this.settings.autoIdPrefix
                          + this.idStart);
                    this.idStart += 1;
                }
            }
            node.attributes.ids.push(id);
        }
        this.ids[id] = node;
        return id;
    }

    setNameIdMap(node, id, msgnode, explicit) {
        node.attributes.names.forEach((name) => {
            if (name in this.nameIds) {
                this.set_duplicate_name_id(node, id, name, msgnode, explicit);
            } else {
                this.nameIds[name] = id;
                this.nameTypes[name] = explicit;
            }
        });
    }

    setDuplicateNameId(node, id, name, msgnode, explicit) {
        const oldId = this.nameIds[name];
        const oldExplicit = this.nameTypes[name];
        this.nameTypes[name] = oldExplicit || explicit;
        let oldNode;
        if (explicit) {
            if (oldExplicit) {
                let level = 2;
                if (oldId != null) {
                    oldNode = this.ids[oldId];
                    if ('refuri' in node.attributes) {
                        const refuri = node.attributes.refuri;
                        if (oldNode.attributes.names.length
                           && 'refuri' in oldNode.attributes
                           && oldNode.attributes.refuri === refuri) {
                            level = 1; // just inform if refuri's identical
                        }
                    }
                    if (level > 1) {
                        dupname(oldNode, name);
                        this.nameIds[name] = null;
                    }
                }
                const msg = this.reporter.systemMessage(
                    level, `Duplicate explicit target name: "${name}".`,
                    [], { backrefs: [id], base_node: node },
);
                if (msgnode != null) {
                    msgnode.add(msg);
                }
                dupname(node, name);
            } else {
                this.nameIds[name] = id;
                if (oldId != null) {
                    oldNode = this.ids[oldId];
                    dupname(oldNode, name);
                }
            }
        } else {
            if (oldId != null && !oldExplicit) {
                this.nameIds[name] = null;
                oldNode = this.ids[oldId];
                dupname(oldNode, name);
            }
            dupname(node, name);
        }
        if (!explicit || (!oldExplicit && oldId != null)) {
            const msg = this.reporter.info(
                `Duplicate implicit target name: "${name}".`, [],
                { backrefs: [id], base_node: node },
);
            if (msgnode != null) {
                msgnode.add(msg);
            }
        }
    }

    hasName(name) {
        return Object.keys(this.nameIds).includes(name);
    }

    noteImplicitTarget(target, msgnode) {
        const id = this.setId(target, msgnode);
        this.setNameIdMap(target, id, msgnode);
    }

    noteExplicitTarget(target, msgnode) {
        const id = this.setId(target, msgnode);
        this.setNameIdMap(target, id, msgnode, true);
    }

    noteRefname(node) {
        const a = [node];
        if (this.refNames[node.refname]) {
            this.refNames[node.refname].push(node);
        } else {
            this.refNames[node.refname] = a;
        }
    }

    noteRefId(node) {
        const a = [node];
        if (this.refIds[node.refid]) {
            this.refIds[node.refid].push(node);
        } else {
            this.refIds[node.refid] = a;
        }
    }

    noteIndirectTarget(target) {
        this.indirectTargets.push(target);
        if (target.names) {
            this.noteRefname(target);
        }
    }

    noteAnonymousTarget(target) {
        this.setId(target);
    }

    noteAutofootnote(footnote) {
        this.setId(footnote);
        this.autofootnotes.push(footnote);
    }

    noteAutofootnoteRef(ref) {
        this.setId(ref);
        this.autofootnoteRefs.push(ref);
    }

    noteSymbolFootnote(footnote) {
        this.setId(footnote);
        this.symbolFootnotes.push(footnote);
    }

    noteSymbolFootnoteRef(ref) {
        this.setId(ref);
        this.symbolFootnoteRefs.push(ref);
    }

    noteFootnote(footnote) {
        this.setId(footnote);
        this.footnotes.push(footnote);
    }

    noteFootnoteRef(ref) {
        this.setId(ref);
        const a = [ref];
        if (this.footnoteRefs[ref.refname]) {
            this.footnoteRefs[ref.refname].push(ref);
        } else {
            this.footnoteRefs[ref.refname] = a;
        }
        this.noteRefname(ref);
    }

    noteCitation(citation) {
        this.citations.push(citation);
    }

    noteCitationRef(ref) {
        this.setId(ref);
        this.citationRefs.setDefault(ref.refname, []).push(ref);
        this.noteRefname(ref);
    }

    noteSubstitutionDef(subdef, defName, msgnode) {
        const name = whitespaceNormalizeName(defName);
        if (Object.keys(this.substitutionDefs).includes(name)) {
            const msg = this.reporter.error(`Duplicate substitution definition name: "${name}".`, { baseNode: subdef });
            if (msgnode != null) {
                msgnode.add(msg);
            }
            const oldnode = this.substitutionDefs[name];
            dupname(oldnode, name);
        }
        this.substitutionDefs[name] = subdef;
        this.substitutionNames[fullyNormalizeName(name)] = name;
    }

    noteSubstitutionRef(subref, refname) {
        subref.refname = whitespaceNormalizeName(refname);
    }

    notePending(pending, priority) {
        this.transformer.addPending(pending, priority);
    }

    noteParseMessage(message) {
        this.parseMessages.push(message);
    }

    noteTransformMessage(message) {
        this.transformMessages.push(message);
    }

    noteSource(source, offset) {
        this.currentSource = source;
        if (offset === undefined) {
            this.currentLine = offset;
        } else {
            this.currentLine = offset + 1;
        }
    }

    copy() {
        // copy
    }

    getDecoration() {
        if (!this.decoration) {
            this.decoration = new decoration();
            const index = this.firstChildNotMatchingClass(Titular);
            if (index === undefined) {
                this.push(this.decoration);
            } else {
                this.insert(index, this.decoration);
            }
        }
        return this.decotration;
    }
}

export class FixedTextElement extends TextElement {
/*    def __init__(self, rawsource='', text='', *children, **attributes):
        TextElement.__init__(self, rawsource, text, *children, **attributes)
        self.attributes['xml:space'] = 'preserve'
*/
}

export class section extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
} // Structural


// ================
//  Title Elements
// ================
export class title extends TextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
} // Titular, Prebib

export class subtitle extends TextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
} // Titular, Prebib

export class rubric extends TextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
} // Titular


// ========================
//  Bibliographic Elements
// ========================

export class docinfo extends Element { }

export class author extends TextElement { }

export class authors extends Element { }

export class organization extends TextElement { }

export class address extends FixedTextElement { }

export class contact extends TextElement { }

export class version extends TextElement { }

export class revision extends TextElement { }

export class status extends TextElement { }

export class date extends TextElement { }

export class copyright extends TextElement { }


export class paragraph extends TextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
} // General
/* class compound(General, Element): pass
class container(General, Element): pass
class bullet_list(Sequential, Element): pass
class enumerated_list(Sequential, Element): pass
class list_item(Part, Element): pass */
export class classifier extends TextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
}
/* eslint-disable-next-line camelcase */
export class definition_list extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
}
/* eslint-disable-next-line camelcase */
export class definition_list_item extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
}
export class term extends TextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
}
export class definition extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
}
/*
class classifier(Part, TextElement): pass
*/
/* eslint-disable-next-line camelcase */
export class field_list extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
} // (Sequential, Element
export class field extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
} // (Part
/* eslint-disable-next-line camelcase */
export class field_name extends TextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
} // (Part
/* eslint-disable-next-line camelcase */
export class field_body extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
} // (Part


/* eslint-disable-next-line camelcase */
export class bullet_list extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
} // Sequential
/* eslint-disable-next-line camelcase */
export class list_item extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
}

/* Inline elements */
export class emphasis extends TextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
} // Inline
export class strong extends TextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
} // Inline
export class literal extends TextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
} // Inline
export class reference extends TextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
} // General, Inline, Referential
/* eslint-disable-next-line camelcase */
export class footnote_reference extends TextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
} // General, Inline, Referential
/* eslint-disable-next-line camelcase */
export class citation_reference extends TextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
} // General, Inline, Referential
/* eslint-disable-next-line camelcase */
export class substitution_reference extends TextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
} // General, Inline, Referential
/* eslint-disable-next-line camelcase */
export class title_reference extends TextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
} // General, Inline, Referential

export class problematic extends TextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
} // Inline

export class transition extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
} // Structura


export class option extends Element {
    // fixme//child_text_separator = ''
}

/* eslint-disable-next-line camelcase */
export class option_argument extends TextElement {
    // fixme
    // def astext(self):
    // return self.get('delimiter', ' ') + TextElement.astext(self)
}

/* eslint-disable-next-line camelcase */
export class option_group extends Element {
    // child_text_separator = ', '
}

/* eslint-disable-next-line camelcase */
export class option_list extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
} // Sequential
/* eslint-disable-next-line camelcase */
export class option_list_item extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
} //    child_text_separator = '
/* eslint-disable-next-line camelcase */
export class option_string extends TextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
} // (Part
export class description extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
} // (Part
/* eslint-disable-next-line camelcase */
export class literal_block extends FixedTextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
}
/* eslint-disable-next-line camelcase */
export class doctest_block extends FixedTextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
}
/* eslint-disable-next-line camelcase */
export class math_block extends FixedTextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
}
/* eslint-disable-next-line camelcase */
export class line_block extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
}
export class line extends TextElement {
    _init(...args) {
        super._init(...args);
        this.indent = undefined;
    }
} // Part
/* eslint-disable-next-line camelcase */
export class block_quote extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
}
export class attribution extends TextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
}
export class attention extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
}
export class caution extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
}
export class danger extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
}
export class error extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
}
export class important extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
}
export class note extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
}
export class tip extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
}
export class hint extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
}
export class warning extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
}
export class admonition extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
}
export class comment extends FixedTextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
}
/* eslint-disable-next-line camelcase */
export class substitution_definition extends TextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
}
export class target extends TextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
}
export class footnote extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
}
export class citation extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
}
export class label extends TextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
}
export class figure extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
}
export class caption extends TextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
}
export class legend extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
}
export class table extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
}
export class tgroup extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
}
export class colspec extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
}
export class thead extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
}
export class tbody extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
}
export class row extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
}
export class entry extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
    }
}


/* eslint-disable-next-line camelcase */
export class system_message extends Element {
    constructor(message, children, attributes) {
        super(attributes.rawsource || '', message ? [new paragraph('', message), ...children] : children, attributes);
        setupBacklinkable(this);
    }
}
