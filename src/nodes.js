import xmlescape from 'xml-escape';
import Transformer from './Transformer';
import { InvalidArgumentsError, ApplicationError } from './Exceptions';
import unescape from './utils/unescape';
import { isIterable, checkDocumentArg } from './utils';

const _nonIdChars = /[^a-z0-9]+/ig;
const _nonIdAtEnds = /^[-0-9]+|-+$/;
const _nonIdTranslate = {
    0x00f8: 'o', // o with stroke
    0x0111: 'd', // d with stroke
    0x0127: 'h', // h with stroke
    0x0131: 'i', // dotless i
    0x0142: 'l', // l with stroke
    0x0167: 't', // t with stroke
    0x0180: 'b', // b with stroke
    0x0183: 'b', // b with topbar
    0x0188: 'c', // c with hook
    0x018c: 'd', // d with topbar
    0x0192: 'f', // f with hook
    0x0199: 'k', // k with hook
    0x019a: 'l', // l with bar
    0x019e: 'n', // n with long right leg
    0x01a5: 'p', // p with hook
    0x01ab: 't', // t with palatal hook
    0x01ad: 't', // t with hook
    0x01b4: 'y', // y with hook
    0x01b6: 'z', // z with stroke
    0x01e5: 'g', // g with stroke
    0x0225: 'z', // z with hook
    0x0234: 'l', // l with curl
    0x0235: 'n', // n with curl
    0x0236: 't', // t with curl
    0x0237: 'j', // dotless j
    0x023c: 'c', // c with stroke
    0x023f: 's', // s with swash tail
    0x0240: 'z', // z with swash tail
    0x0247: 'e', // e with stroke
    0x0249: 'j', // j with stroke
    0x024b: 'q', // q with hook tail
    0x024d: 'r', // r with stroke
    0x024f: 'y', // y with stroke
};
const _nonIdTranslateDigraphs = {
    0x00df: 'sz', // ligature sz
    0x00e6: 'ae', // ae
    0x0153: 'oe', // ligature oe
    0x0238: 'db', // db digraph
    0x0239: 'qp', // qp digraph
};

function dupname(node, name) {
    /* What is the intention of this function? */
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

/* We don't do 'psuedo-xml' but perhaps we should */
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

/* This needs to be implemented - fixme */
function makeId(string) {
    return string;
    /*
    let id = string.lower();
    // This is for unicode, I believe?
    //if not isinstance(id, str):
    //id = id.decode()
    id = id.translate(_non_id_translate_digraphs)
    id = id.translate(_non_id_translate)
    // get rid of non-ascii characters.
    // 'ascii' lowercase to prevent problems with turkish locale.
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

const nodeClassNames = ['Text', 'abbreviation', 'acronym', 'address', 'admonition', 'attention',
                        'attribution', 'author', 'authors', 'block_quote', 'bullet_list', 'caption',
                        'caution', 'citation', 'citation_reference', 'classifier', 'colspec', 'comment',
                        'compound', 'contact', 'container', 'copyright', 'danger', 'date', 'decoration',
                        'definition', 'definition_list', 'definition_list_item', 'description', 'docinfo',
                        'doctest_block', 'document', 'emphasis', 'entry', 'enumerated_list', 'error', 'field',
                        'field_body', 'field_list', 'field_name', 'figure', 'footer', 'footnote',
                        'footnote_reference', 'generated', 'header', 'hint', 'image', 'important', 'inline',
                        'label', 'legend', 'line', 'line_block', 'list_item', 'literal', 'literal_block', 'math',
                        'math_block', 'note', 'option', 'option_argument', 'option_group', 'option_list',
                        'option_list_item', 'option_string', 'organization', 'paragraph', 'pending',
                        'problematic', 'raw', 'reference', 'revision', 'row', 'rubric', 'section', 'sidebar',
                        'status', 'strong', 'subscript', 'substitution_definition', 'substitution_reference',
                        'subtitle', 'superscript', 'system_message', 'table', 'target', 'tbody', 'term',
                        'tgroup', 'thead', 'tip', 'title', 'title_reference', 'topic', 'transition', 'version',
                        'warning'];

const SkipChildren = class {};
const StopTraversal = class {};
const SkipNode = class {};
const SkipDeparture = class {};
const SkipSiblings = class {};

export class NodeVisitor {
    constructor(document) {
        if (!checkDocumentArg(document)) {
            throw new Error(`Invalid document arg: ${document}`);
        }
        this.document = document;
        this.optional = [];
    }

    dispatchVisit(node) {
        const nodeName = node.tagname;
        const methodName = `visit_${nodeName}`;
        let method = this[methodName];
        if (!method) {
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
        this.classes = [];
        this._init();
    }

    _init() {
    }

    nextNode(self, condition, includeSelf = false, descend = true,
              siblings = false, ascend = false) {
        /* """
        Return the first node in the iterable returned by traverse(),
        or None if the iterable is empty.

        Parameter list is the same as of traverse.  Note that
        include_self defaults to 0, though.
        """ */
        const iterable = this.traverse(condition, includeSelf, descend, siblings, ascend);
        if (iterable.length) {
            return iterable[0];
        }
        return undefined;
    }

    isInline() {
        return this.classes.firstIndex(c => c.prototype instanceof Inline || c === Inline) !== -1;
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

    _fastTraverse(cls) {
        // Specialized traverse() that only supports instance checks.
        const result = [];
        if (this instanceof cls) {
            result.push(this);
        }
        const myNode = this;
        myNode.children.forEach((child) => {
            if (typeof child === 'undefined') {
                throw new Error('child is undefined');
            }
            if (typeof child._fastTraverse === 'undefined') {
                throw new Error(`${child} does not have _fastTraverse`);
            }
            result.push(...child._fastTraverse(cls));
        });
        return result;
    }

    _allTraverse() {
        // Specialized traverse() that doesn't check for a condition.
        const result = [];
        result.push(this);
        this.children.forEach((child) => {
            result.push(...child._allTraverse());
        });
        return result;
    }

    traverse(condition, includeSelf = true, descend = true, siblings = false, ascend = false) {
        const mySiblings = ascend ? true : siblings;
        if (includeSelf && descend && !mySiblings) {
            if (!condition) {
                return this._allTraverse();
            } if (condition.prototype instanceof Node || condition === Node) {
                return this._fastTraverse(condition);
            }
        }
        if (condition.prototype instanceof Node || condition === Node) {
            const nodeClass = condition;
            /* eslint-disable-next-line no-unused-vars */
            const myCondition = (node, nodeClassArg) => ((node instanceof nodeClassArg) || (node instanceof nodeClass));
            throw new Error('unimplemented');
        }

        throw new Error('unimplemented');
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
        // document this/
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


/*
 * `Element` is the superclass to all specific elements.

 *  Elements contain attributes and child nodes.  Elements emulate
 *  dictionaries for attributes, indexing by attribute name (a string).  To
 *  set the attribute 'att' to 'value', do::
 *
 *      element['att'] = 'value'
 *
 *  There are two special attributes: 'ids' and 'names'.  Both are
 *  lists of unique identifiers, and names serve as human interfaces
 *  to IDs.  Names are case- and whitespace-normalized (see the
 *  fully_normalize_name() function), and IDs conform to the regular
 *  expression ``[a-z](-?[a-z0-9]+)*`` (see the make_id() function).
 *
 *  Elements also emulate lists for child nodes (element nodes and/or text
 *  nodes), indexing by integer.  To get the first child node, use::
 *
 *      element[0]
 *
 *  Elements may be constructed using the ``+=`` operator.  To add one new
 *  child node to element, do::
 *
 *      element += node
 *
 *  This is equivalent to ``element.append(node)``.
 *
 *  To add a list of multiple child nodes at once, use the same ``+=``
 *  operator::
 *
 *      element += [node1, node2]
 *
 *  This is equivalent to ``element.extend([node1, node2])``.
 */
export class Element extends Node {
    _init() {
        super._init();
        /* List attributes which are defined for every Element-derived class
           instance and can be safely transferred to a different node. */
        this.basicAttributes = ['ids', 'classes', 'names', 'dupnames'];
        /*
          "A list of class-specific attributes that should not be copied with the
          standard attributes when replacing a node.

          NOTE: Derived classes should override this value to prevent any of its
          attributes being copied by adding to the value in its parent class.
        */
        this.localAttributes = ['backrefs'];

        /* List attributes, automatically initialized to empty lists
           for all nodes. */
        this.listAttributes = [...this.basicAttributes, ...this.localAttributes];

        /* List attributes that are known to the Element base class. */
        this.knownAttributes = [...this.listAttributes, 'source', 'rawsource'];

        /* The element generic identifier. If None, it is set as an
           instance attribute to the name of the class. */
        // this.tagname = undefined; (already set in Node.constructor)

        /* Separator for child nodes, used by `astext()` method. */
        this.childTextSeparator = '\n\n';
    }

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

        // unsure of the correct js equivalent
        /*
          if self.tagname is None:
          self.tagname = self.__class__.__name__
        */
    }

    _domNode(domroot) {
        const element = domroot.createElement(this.tagname);
        Object.entries(this.attlist()).forEach(([attribute, value]) => {
            let myVal;
            if (isIterable(value)) {
                myVal = value.map(v => serialEscape(v.toString())).join(' ');
            } else {
                myVal = value.toString();
            }
            element.setAttribute(attribute, myVal);
        });
        this.children.forEach((child) => {
            if (typeof child._domNode !== 'function') {
                throw new ApplicationError(`${child} has no _domNode`);
            }
            element.appendChild(child._domNode(domroot));
        });
        return element;
    }

    emptytag() {
        return `<${[this.tagname, ...Object.entries(this.attlist())
                 .map(([n, v]) => `${n}="${v}"`)].join(' ')}/>`;
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

    /*
       Return the index of the first child whose class does *not* match.

       Parameters:

       - `childclass`: A `Node` subclass to skip, or a tuple of `Node`
       classes. If a tuple, none of the classes may match.
       - `start`: Initial index to check.
       - `end`: Initial index to *not* check.
    */
    firstChildNotMatchingClass(childClass, start = 0,
                               end = this.children.length) {
        const myChildClass = Array.isArray(childClass) ? childClass : [childClass];
        const r = this.children.slice(start, Math.min(this.children.length, end)).findIndex((child, index) => {
            if (myChildClass.findIndex((c) => {
                // if (typeof child === 'undefined') {
                //     throw new Error(`child should not be undefined, index ${index}`);
                // }
                if (child instanceof c
                    || (this.children[index].classes.filter((c2 => c2.prototype instanceof c || c2 === c))).length) {
                    return true;
                }
                return false;
            }) === -1) {
                console.log(`returning index ${index} ${nodeToXml(this.children[index])}`);
                return true;
            }
        });
        if (r !== -1) {
            return r;
        }
        return undefined;
    }

    /*
      Update basic attributes ('ids', 'names', 'classes',
      'dupnames', but not 'source') from node or dictionary `dict_`.
    */
    updateBasicAtts(dict_) {
        const dict2 = dict_ instanceof Node ? dict_.attributes : dict_;
        this.basicAttributes.forEach((att) => {
            const v = att in dict2 ? dict2[att] : [];
            this.appendAttrList(att, v);
        });
    }

    /*
      For each element in values, if it does not exist in self[attr], append
      it.

      NOTE: Requires self[attr] and values to be sequence type and the
      former should specifically be a list.
    */
    appendAttrList(attr, values) {
        // List Concatenation
        values.forEach((value) => {
            if ((this.attributes[attr].filter(v => v === value)).length === 0) {
                this.attributes[attr].push(value);
            }
        });
    }

    /*
      If self[attr] does not exist or force is True or omitted, set
      self[attr] to value, otherwise do nothing.
    */
    replaceAttr(attr, value, force = true) {
        // One or the other
        if (force || this.attributes[attr] == null) {
            this.attributes[attr] = value;
        }
    }

    /*
      If replace is true or this.attributes[attr] is null, replace
      this.attributes[attr] with value.  Otherwise, do nothing.
    */
    copyAttrConsistent(attr, value, replace) {
        if (this.attributes[attr] !== value) {
            this.replaceAttr(attr, value, replace);
        }
    }

    /*
      Updates all attributes from node or dictionary `dict_`.

        Appends the basic attributes ('ids', 'names', 'classes',
        'dupnames', but not 'source') and then, for all other attributes in
        dict_, updates the same attribute in self.  When attributes with the
        same identifier appear in both self and dict_, the two values are
        merged based on the value of update_fun.  Generally, when replace is
        True, the values in self are replaced or merged with the values in
        dict_; otherwise, the values in self may be preserved or merged.  When
        and_source is True, the 'source' attribute is included in the copy.

        NOTE: When replace is False, and self contains a 'source' attribute,
              'source' is not replaced even when dict_ has a 'source'
              attribute, though it may still be merged into a list depending
              on the value of update_fun.
        NOTE: It is easier to call the update-specific methods then to pass
              the update_fun method to this function.
    */
    updateAllAtts(dict_, updateFun = this.copyAttrConsistent,
                    replace = true, andSource = false) {
        const dict2 = dict_ instanceof Node ? dict_.attributes : dict_;
        // Include the source attribute when copying?
        let filterFun;
        if (andSource) {
            filterFun = this.isNotListAttribute.bind(this);
        } else {
            filterFun = this.isNotKnownAttribute.bind(this);
        }

        // Copy the basic attributes
        this.updateBasicAtts(dict2);

        // Grab other attributes in dict_ not in self except the
        // (All basic attributes should be copied already)
        const atts = Object.keys(dict2).filter(filterFun);
        atts.forEach((att) => {
            updateFun.bind(this)(att, dict2[att], replace);
        });
    }

    /*    """
        Updates all attributes from node or dictionary `dict_`.

        Appends the basic attributes ('ids', 'names', 'classes',
        'dupnames', but not 'source') and then, for all other attributes in
        dict_, updates the same attribute in self.  When attributes with the
        same identifier appear in both self and dict_ whose values aren't each
        lists and replace is True, the values in self are replaced with the
        values in dict_; if the values from self and dict_ for the given
        identifier are both of list type, then the two lists are concatenated
        and the result stored in self; otherwise, the values in self are
        preserved.  When and_source is True, the 'source' attribute is
        included in the copy.

        NOTE: When replace is False, and self contains a 'source' attribute,
              'source' is not replaced even when dict_ has a 'source'
              attribute, though it may still be merged into a list depending
              on the value of update_fun.
              """ */
    updateAllAttsConcatenating(dict_, replace = true,
                               andSource = false) {
        this.updateAllAtts(dict_, this.copyAttrConcatenate, replace,
                           andSource);
    }

    /*
      Returns True if and only if the given attribute is NOT one of the
      basic list attributes defined for all Elements.
    */
    isNotListAttribute(attr) {
        return !(attr in this.listAttributes);
    }

    /*
        Returns True if and only if the given attribute is NOT recognized by
        this class.
    */
    isNotKnownAttribute(attr) {
        return !(attr in this.knownAttributes);
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

    _domNode(domroot) {
        return domroot.createTextNode(this.data);
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


export class document extends Element {
    constructor(settings, reporter, ...args) {
        super(...args);
        this.classes = [Root, Structural];
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
        this.citationRefs = {};
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
                this.setDuplicateNameId(node, id, name, msgnode, explicit);
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
        if (this.citationRefs[ref.refname]) {
            this.citationRefs[ref.refname].push(ref);
        } else {
            this.citationRefs[ref.refname] = [ref];
        }
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
                this.children.push(this.decoration);
            } else {
                this.children.splice(index, 0, this.decoration);
            }
        }
        return this.decoration;
    }
}

export class FixedTextElement extends TextElement {
/*    def __init__(self, rawsource='', text='', *children, **attributes):
        TextElement.__init__(self, rawsource, text, *children, **attributes)
        self.attributes['xml:space'] = 'preserve'
*/
}

// ========
//  Mixins
// ========

export class Resolvable {
//    resolved = 0
}

export class BackLinkable {
    addBackref(refid) {
        this.backrefs.push(refid);
    }
}


// ====================
//  Element Categories
// ====================

export class Root { }

export class Titular { }

// """Category of Node which may occur before Bibliographic Nodes."""
export class PreBibliographic { }

export class Bibliographic { }

export class Decorative extends PreBibliographic { }

export class Structural { }

export class Body { }

export class General extends Body { }

// """List-like elements."""
export class Sequential extends Body {
}

export class Admonition extends Body { }

// """Special internal body elements."""
export class Special extends Body { }

// """Internal elements that don't appear in output."""
export class Invisible extends PreBibliographic { }

export class Part { }

export class Inline { }

export class Referential extends Resolvable { }

export class Targetable extends Resolvable {
    // referenced = 0
    // indirect_reference_name = null
    /* """Holds the whitespace_normalized_name (contains mixed case) of a target.
    Required for MoinMoin/reST compatibility."""
    */
}

// """Contains a `label` as its first element."""
export class Labeled { }

// ================
//  Title Elements
// ================
export class title extends TextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [Titular, PreBibliographic];
    }
}

export class subtitle extends TextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [Titular, PreBibliographic];
    }
}

export class rubric extends TextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [Titular];
    }
}

// ========================
//  Bibliographic Elements
// ========================

export class docinfo extends Element {
    constructor(...args) {
        super(...args);
        this.classes = [Bibliographic];
    }
}

export class author extends TextElement {
    constructor(...args) {
        super(...args);
        this.classes = [Bibliographic];
    }
}

export class authors extends Element {
    constructor(...args) {
        super(...args);
        this.classes = [Bibliographic];
    }
}

export class organization extends TextElement {
    constructor(...args) {
        super(...args);
        this.classes = [Bibliographic];
    }
}

export class address extends FixedTextElement {
    constructor(...args) {
        super(...args);
        this.classes = [Bibliographic];
    }
}

export class contact extends TextElement {
    constructor(...args) {
        super(...args);
        this.classes = [Bibliographic];
    }
}

export class version extends TextElement {
    constructor(...args) {
        super(...args);
        this.classes = [Bibliographic];
    }
}

export class revision extends TextElement {
    constructor(...args) {
        super(...args);
        this.classes = [Bibliographic];
    }
}

export class status extends TextElement {
    constructor(...args) {
        super(...args);
        this.classes = [Bibliographic];
    }
}

export class date extends TextElement {
    constructor(...args) {
        super(...args);
        this.classes = [Bibliographic];
    }
}

export class copyright extends TextElement {
    constructor(...args) {
        super(...args);
        this.classes = [Bibliographic];
    }
}

// =====================
//  Decorative Elements
// =====================
export class decoration extends Element {
    constructor(...args) {
        super(...args);
        this.classes = [Decorative];
    }

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
export class header extends Element {
    constructor(...args) {
        super(...args);
        this.classes = [Decorative];
    }
} // Decorative
export class footer extends Element {
    constructor(...args) {
        super(...args);
        this.classes = [Decorative];
    }
} // Decorative

export class section extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [Structural];
    }
}

/*    """
    Topics are terminal, "leaf" mini-sections, like block quotes with titles,
    or textual figures.  A topic is just like a section, except that it has no
    subsections, and it doesn't have to conform to section placement rules.

    Topics are allowed wherever body elements (list, table, etc.) are allowed,
    but only at the top level of a section or document.  Topics cannot nest
    inside topics, sidebars, or body elements; you can't have a topic inside a
    table, list, block quote, etc.
    """ */
export class topic extends Element {
    constructor(...args) {
        super(...args);
        this.classes = [Structural];
    }
}

/*
    Sidebars are like miniature, parallel documents that occur inside other
    documents, providing related or reference material.  A sidebar is
    typically offset by a border and "floats" to the side of the page; the
    document's main text may flow around it.  Sidebars can also be likened to
    super-footnotes; their content is outside of the flow of the document's
    main text.

    Sidebars are allowed wherever body elements (list, table, etc.) are
    allowed, but only at the top level of a section or document.  Sidebars
    cannot nest inside sidebars, topics, or body elements; you can't have a
    sidebar inside a table, list, block quote, etc.
*/
export class sidebar extends Element {
    constructor(...args) {
        super(...args);
        this.classes = [Structural];
    }
}

export class transition extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [Structural];
    }
} // Structural

// ===============
//  Body Elements
// ===============

export class paragraph extends TextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [General];
    }
} // General

export class compound extends Element {
    constructor(...args) {
        super(...args);
        this.classes = [General];
    }
}


export class container extends Element {
    constructor(...args) {
        super(...args);
        this.classes = [General];
    }
}
/* eslint-disable-next-line camelcase */
export class bullet_list extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [Sequential];
    }
} // Sequential

export class enumerated_list extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [Sequential];
    }
} // Sequential


/* eslint-disable-next-line camelcase */
export class list_item extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [Part];
    }
}

/* eslint-disable-next-line camelcase */
export class definition_list extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [Sequential];
    }
}

/* eslint-disable-next-line camelcase */
export class definition_list_item extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [Part];
    }
}

export class term extends TextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [Part];
    }
}

export class classifier extends TextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [Part];
    }
}
export class definition extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [Part];
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
        this.classes = [Seqeuential];
    }
} // (Sequential, Element
export class field extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [Part];
    }
} // (Part
/* eslint-disable-next-line camelcase */
export class field_name extends TextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [Part];
    }
} // (Part
/* eslint-disable-next-line camelcase */
export class field_body extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [Part];
    }
} // (Part

export class option extends Element {
    constructor(...args) {
        super(...args);
        this.classes = [Part];
        this.childTextSeparator = ''; // fixme test this
    }
}

/* eslint-disable-next-line camelcase */
export class option_argument extends TextElement {
    constructor(...args) {
        super(...args);
        this.classes = [Part];
    }

    // fixme test this
    astext() {
        const r = super.astext();
        return (this.attributes.delimiter || ' ') + r;
    }
}

/* eslint-disable-next-line camelcase */
export class option_group extends Element {
    constructor(...args) {
        super(...args);
        this.classes = [Part];
        this.childTextSeparator = ', ';
    }
}

/* eslint-disable-next-line camelcase */
export class option_list extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [Sequential];
    }
} // Sequential
/* eslint-disable-next-line camelcase */
export class option_list_item extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [Part];
        this.childTextSeparator = '  ';
    }
}

/* eslint-disable-next-line camelcase */
export class option_string extends TextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [Part];
    }
} // (Part
export class description extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [Part];
    }
} // (Part

/* eslint-disable-next-line camelcase */
export class literal_block extends FixedTextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [General];
    }
}

/* eslint-disable-next-line camelcase */
export class doctest_block extends FixedTextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [General];
    }
}

/* eslint-disable-next-line camelcase */
export class math_block extends FixedTextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [General];
    }
}
/* eslint-disable-next-line camelcase */
export class line_block extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [General];
    }
}
export class line extends TextElement {
    _init(...args) {
        super._init(...args);
        this.indent = undefined;
        this.classes = [Part];
    }
} // Part

/* eslint-disable-next-line camelcase */
export class block_quote extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [General];
    }
}
export class attribution extends TextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [Part];
   }
}
export class attention extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [Admonition];
    }
}
export class caution extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [Admonition];
    }
}
export class danger extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [Admonition];
    }
}
export class error extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [Admonition];
    }
}
export class important extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [Admonition];
    }
}
export class note extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [Admonition];
    }
}

export class tip extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [Admonition];
    }
}
export class hint extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [Admonition];
    }
}
export class warning extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [Admonition];
    }
}
export class admonition extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [Admonition];
    }
}
export class comment extends FixedTextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [Special, Invisible, Inline, Targetable];
    }
}
/* eslint-disable-next-line camelcase */
export class substitution_definition extends TextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [Special, Invisible];
    }
}
export class target extends TextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [Special, Invisible, Inline, Targetable];
    }
}
export class footnote extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [General, BackLinkable, Labeled, Targetable];
    }
}
export class citation extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [General, BackLinkable, Labeled, Targetable];
    }
}
export class label extends TextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [Part];
    }
}
export class figure extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [General];
    }
}
export class caption extends TextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [Part];
    }
}
export class legend extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [Part];
    }
}

export class table extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [General];
    }
}
export class tgroup extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [Part];
    }
}
export class colspec extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [Part];
    }
}
export class thead extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [Part];
    }
}
export class tbody extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [Part];
    }
}
export class row extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [Part];
    }
}
export class entry extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [Part];
    }
}

/* eslint-disable-next-line camelcase */
export class system_message extends Element {
    constructor(message, children, attributes) {
        super(attributes.rawsource || '', message ? [new paragraph('', message), ...children] : children, attributes);
        setupBacklinkable(this);
        this.classes = [Special, BackLinkable, PreBibliographic];
    }
}
/* class pending(Special, Invisible, Element):

    """
    The "pending" element is used to encapsulate a pending operation: the
    operation (transform), the point at which to apply it, and any data it
    requires.  Only the pending operation's location within the document is
    stored in the public document tree (by the "pending" object itself); the
    operation and its data are stored in the "pending" object's internal
    instance attributes.

    For example, say you want a table of contents in your reStructuredText
    document.  The easiest way to specify where to put it is from within the
    document, with a directive::

        .. contents::

    But the "contents" directive can't do its work until the entire document
    has been parsed and possibly transformed to some extent.  So the directive
    code leaves a placeholder behind that will trigger the second phase of its
    processing, something like this::

        <pending ...public attributes...> + internal attributes

    Use `document.note_pending()` so that the
    `docutils.transforms.Transformer` stage of processing can run all pending
    transforms.
    """

    def __init__(self, transform, details=None,
                 rawsource='', *children, **attributes):
        Element.__init__(self, rawsource, *children, **attributes)

        self.transform = transform
        """The `docutils.transforms.Transform` class implementing the pending
        operation."""

        self.details = details or {}
        """Detail data (dictionary) required by the pending operation."""

    def pformat(self, indent='    ', level=0):
        internals = [
              '.. internal attributes:',
              '     .transform: %s.%s' % (self.transform.__module__,
                                          self.transform.__name__),
              '     .details:']
        details = self.details.items()
        details.sort()
        for key, value in details:
            if isinstance(value, Node):
                internals.append('%7s%s:' % ('', key))
                internals.extend(['%9s%s' % ('', line)
                                  for line in value.pformat().splitlines()])
            elif value and isinstance(value, list) \
                  and isinstance(value[0], Node):
                internals.append('%7s%s:' % ('', key))
                for v in value:
                    internals.extend(['%9s%s' % ('', line)
                                      for line in v.pformat().splitlines()])
            else:
                internals.append('%7s%s: %r' % ('', key, value))
        return (Element.pformat(self, indent, level)
                + ''.join([('    %s%s\n' % (indent * level, line))
                           for line in internals]))

    def copy(self):
        obj = self.__class__(self.transform, self.details, self.rawsource,
                              **self.attributes)
        obj.document = self.document
        obj.source = self.source
        obj.line = self.line
        return obj

*/
export class raw extends FixedTextElement {
    constructor(...args) {
        super(...args);
        this.classes = [Special, Inline, PreBibliographic];
    }
}

// =================
//  Inline Elements
// =================
export class emphasis extends TextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [Inline];
    }
}
export class strong extends TextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [Inline];
    }
} // Inline
export class literal extends TextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [Inline];
    }
} // Inline
export class reference extends TextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [General, Inline, Referential];
    }
} // General, Inline, Referential
/* eslint-disable-next-line camelcase */
export class footnote_reference extends TextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [General, Inline, Referential];
    }
} // General, Inline, Referential
/* eslint-disable-next-line camelcase */
export class citation_reference extends TextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [General, Inline, Referential];
    }
} // General, Inline, Referential
/* eslint-disable-next-line camelcase */
export class substitution_reference extends TextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [Inline];
    }
} // General, Inline, Referential
/* eslint-disable-next-line camelcase */
export class title_reference extends TextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [Inline];
    }
} // General, Inline, Referential

/* eslint-disable-next-line camelcase */
export class abbreviation extends TextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [Inline];
    }
}

export class acronym extends TextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [Inline];
    }
}

export class superscript extends TextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [Inline];
    }
}

export class subscript extends TextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [Inline];
    }
}
export class math extends TextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [Inline];
    }
}
export class image extends Element {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [General, Inline];
    }

    astext() {
        return this.attributes.alt || '';
    }
}


export class inline extends TextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [Inline];
    }
}

export class problematic extends TextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [Inline];
    }
}

export class generated extends TextElement {
/* eslint-disable-next-line no-useless-constructor */
    constructor(...args) {
        super(...args);
        this.classes = [Inline];
    }
}

// ========================================
//  Auxiliary Classes, Functions, and Data
// ========================================

export function nodeToXml(node) {
    if (node instanceof Text) {
        const text = xmlescape(node.astext());
        return text;
    }
    if (node.children.length) {
        return [node.starttag(), ...node.children.map(c => nodeToXml(c)), node.endtag()].join('');
    }
    return node.emptytag();
}
