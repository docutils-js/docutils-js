/**
 * Docutils document tree element class library.
 *
 * Classes in CamelCase are abstract base classes or auxiliary classes. The one
 * exception is `Text`, for a text (PCDATA) node; uppercase is used to
 * differentiate from element classes.  Classes in lower_case_with_underscores
 * are element classes, matching the XML element generic identifiers in the DTD_.
 *
 * The position of each node (the level at which it can occur) is significant and
 * is represented by abstract base classes (`Root`, `Structural`, `Body`,
 * `Inline`, etc.).  Certain transformations will be easier because we can use
 * ``isinstance(node, base_class)`` to determine the position of the node in the
 * hierarchy.
 *
 * .. _DTD: http://docutils.sourceforge.net/docs/ref/docutils.dtd
 *
 */
import xmlescape from "xml-escape";
import Transformer from "./Transformer";
/* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
import { InvalidArgumentsError, InvalidStateError, UnimplementedError } from "./Exceptions";
import unescape from "./utils/unescape";
import { checkDocumentArg, isIterable, pySplit } from "./utils";
import {
    Attributes,
    Document,
    ElementInterface,
    FastTraverseArg,
    HasIndent,
    NameIds,
    NodeClass,
    NodeInterface,
    QuoteattrCallback,
    ReporterInterface,
    Systemmessage,
    TextElementInterface,
    TraverseArgs,
    Visitor
} from "./types";
import { Settings } from "../gen/Settings";

/* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
const __docformat__ = "reStructuredText";


/* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
const _nonIdChars = /[^a-z0-9]+/ig;
/* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
const _nonIdAtEnds = /^[-0-9]+|-+$/;
/* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
const _nonIdTranslate = {
    0x00f8: "o", // o with stroke
    0x0111: "d", // d with stroke
    0x0127: "h", // h with stroke
    0x0131: "i", // dotless i
    0x0142: "l", // l with stroke
    0x0167: "t", // t with stroke
    0x0180: "b", // b with stroke
    0x0183: "b", // b with topbar
    0x0188: "c", // c with hook
    0x018c: "d", // d with topbar
    0x0192: "f", // f with hook
    0x0199: "k", // k with hook
    0x019a: "l", // l with bar
    0x019e: "n", // n with long right leg
    0x01a5: "p", // p with hook
    0x01ab: "t", // t with palatal hook
    0x01ad: "t", // t with hook
    0x01b4: "y", // y with hook
    0x01b6: "z", // z with stroke
    0x01e5: "g", // g with stroke
    0x0225: "z", // z with hook
    0x0234: "l", // l with curl
    0x0235: "n", // n with curl
    0x0236: "t", // t with curl
    0x0237: "j", // dotless j
    0x023c: "c", // c with stroke
    0x023f: "s", // s with swash tail
    0x0240: "z", // z with swash tail
    0x0247: "e", // e with stroke
    0x0249: "j", // j with stroke
    0x024b: "q", // q with hook tail
    0x024d: "r", // r with stroke
    0x024f: "y" // y with stroke
};
/* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
const _nonIdTranslateDigraphs = {
    0x00df: "sz", // ligature sz
    0x00e6: "ae", // ae
    0x0153: "oe", // ligature oe
    0x0238: "db", // db digraph
    0x0239: "qp" // qp digraph
};

/**
 * +------+------+
 * | this | is a |
 * +------+------+
 * |ridiculous   |
 * |test         |
 * +-------------+
 */
function dupname(node: NodeInterface, name: string): void {
    /* What is the intention of this function? */
    node.attributes.dupnames.push(name);
    node.attributes.names.splice(node.attributes.names.indexOf(name), 1);
    // Assume that this method is referenced, even though it isn't; we
    // don't want to throw unnecessary system_messages.
    node.referenced = true;
}

/**
 * Escape string values that are elements of a list, for serialization.
 * @param {String} value - Value to escape.
 */
function serialEscape(value: string): string {
    return value.replace(/\\/g, "\\\\").replace(/ /g, "\\ ");
}

/* We don't do 'psuedo-xml' but perhaps we should */
function pseudoQuoteattr(value: string): string {
    return `"${xmlescape(value)}"`;
}

/**
 * Return a whitespace-normalized name.
 */
function whitespaceNormalizeName(name: string): string {
    return name.replace(/\s+/, " ");
}

export function fullyNormalizeName(name: string): string {
    return name.toLowerCase().replace(/\s+/, " ");
}

function setupBacklinkable(o: NodeInterface): void {
    o.addBackref = (refid: string): void => { o.attributes.backrefs.push(refid) };
}

/**
 * Convert `string` into an identifier and return it.
 *
 * Docutils identifiers will conform to the regular expression
 * ``[a-z](-?[a-z0-9]+)*``.  For CSS compatibility, identifiers (the "class"
 * and "id" attributes) should have no underscores, colons, or periods.
 * Hyphens may be used.
 *
 * - The `HTML 4.01 spec`_ defines identifiers based on SGML tokens:
 *
 *       ID and NAME tokens must begin with a letter ([A-Za-z]) and may be
 *       followed by any number of letters, digits ([0-9]), hyphens ("-"),
 *       underscores ("_"), colons (":"), and periods (".").
 *
 * - However the `CSS1 spec`_ defines identifiers based on the "name" token,
 *   a tighter interpretation ("flex" tokenizer notation; "latin1" and
 *   "escape" 8-bit characters have been replaced with entities)::
 *
 *       unicode     \\[0-9a-f]{1,4}
 *       latin1      [&iexcl;-&yuml;]
 *       escape      {unicode}|\\[ -~&iexcl;-&yuml;]
 *       nmchar      [-a-z0-9]|{latin1}|{escape}
 *       name        {nmchar}+
 *
 * The CSS1 "nmchar" rule does not include underscores ("_"), colons (":"),
 * or periods ("."), therefore "class" and "id" attributes should not contain
 * these characters. They should be replaced with hyphens ("-"). Combined
 * with HTML's requirements (the first character must be a letter; no
 * "unicode", "latin1", or "escape" characters), this results in the
 * ``[a-z](-?[a-z0-9]+)*`` pattern.
 *
 * .. _HTML 4.01 spec: http://www.w3.org/TR/html401
 * .. _CSS1 spec: http://www.w3.org/TR/REC-CSS1
 */
function makeId(strVal: string): string {
    let id = strVal.toLowerCase();
    // This is for unicode, I believe?
    //if not isinstance(id, str):
    //id = id.decode()
    // id = translate(_nonIdTranslateDigraphs);
    //id = id.translate(_nonIdTranslate);
    // get rid of non-ascii characters.
    // 'ascii' lowercase to prevent problems with turkish locale.
    //id = unicodedata.normalize('NFKD', id).
    //    encode('ascii', 'ignore').decode('ascii');
    // shrink runs of whitespace and replace by hyphen
    id = pySplit(id).join(' ').replace(_nonIdChars, '-');
    id = id.replace(_nonIdAtEnds, '');
    return id;
}

function _callDefaultVisit(node: NodeInterface): void | undefined | {} {
    // @ts-ignore
    return this.default_visit(node);
}

function _callDefaultDeparture(node: NodeInterface): void | {} | undefined {
    // @ts-ignore
    return this.default_departure(node);
}

/* This is designed to be called later, a-nd not with an object. hmm */
function _addNodeClassNames(names: string[], o: {}): void {
    names.forEach((_name): void => {
        const v = `visit_${_name}`;
        // @ts-ignore
        if (!o[v]) {
            // @ts-ignore
            o[v] = _callDefaultVisit.bind(o);
        }
        const d = `depart_${_name}`;
        // @ts-ignore
        if (!o[d]) {
            // @ts-ignore
            o[d] = _callDefaultDeparture.bind(o);
        }
    });
}

const nodeClassNames = ["Text", "abbreviation", "acronym", "address",
    "admonition", "attention", "attribution", "author",
    "authors", "block_quote", "bullet_list", "caption",
    "caution", "citation", "citation_reference",
    "classifier", "colspec", "comment", "compound",
    "contact", "container", "copyright", "danger",
    "date", "decoration", "definition", "definition_list",
    "definition_list_item", "description", "docinfo",
    "doctest_block", "document", "emphasis", "entry",
    "enumerated_list", "error", "field", "field_body",
    "field_list", "field_name", "figure", "footer",
    "footnote", "footnote_reference", "generated",
    "header", "hint", "image", "important", "inline",
    "label", "legend", "line", "line_block", "list_item",
    "literal", "literal_block", "math",
    "math_block", "note", "option", "option_argument",
    "option_group", "option_list", "option_list_item",
    "option_string", "organization", "paragraph",
    "pending", "problematic", "raw", "reference",
    "revision", "row", "rubric", "section", "sidebar",
    "status", "strong", "subscript",
    "substitution_definition", "substitution_reference",
    "subtitle", "superscript", "system_message", "table",
    "target", "tbody", "term", "tgroup", "thead", "tip",
    "title", "title_reference", "topic", "transition",
    "version", "warning"];

const SkipChildren = class {
};
const StopTraversal = class {
};

class SkipNode extends Error {
}

const SkipDeparture = class {
};
const SkipSiblings = class {
};

/**
 *  "Visitor" pattern [GoF95]_ abstract superclass implementation for
 *  document tree traversals.
 *
 *  Each node class has corresponding methods, doing nothing by
 *  default; override individual methods for specific and useful
 *  behaviour.  The `dispatch_visit()` method is called by
 *  `Node.walk()` upon entering a node.  `Node.walkabout()` also calls
 *  the `dispatch_departure()` method before exiting a node.
 *
 *  The dispatch methods call "``visit_`` + node class name" or
 *  "``depart_`` + node class name", resp.
 *
 *  This is a base class for visitors whose ``visit_...`` & ``depart_...``
 *  methods should be implemented for *all* node types encountered (such as
 *  for `docutils.writers.Writer` subclasses).  Unimplemented methods will
 *  raise exceptions.
 *
 *  For sparse traversals, where only certain node types are of interest,
 *  subclass `SparseNodeVisitor` instead.  When (mostly or entirely) uniform
 *  processing is desired, subclass `GenericNodeVisitor`.
 *
 *  .. [GoF95] Gamma, Helm, Johnson, Vlissides. *Design Patterns: Elements of
 *     Reusable Object-Oriented Software*. Addison-Wesley, Reading, MA, USA,
 *     1995.
 */
class NodeVisitor {
    public document: Document;

    public optional: string[];
    private strictVisitor: boolean | undefined;

    /**
   * Create a NodeVisitor.
   * @param {nodes.document} document - document to visit
   */
    public constructor(document: Document) {
        if (!checkDocumentArg(document)) {
            throw new Error(`Invalid document arg: ${document}`);
        }
        this.document = document;
        const core = document.settings.docutilsCoreOptionParser;
        this.strictVisitor = core.strictVisitor;
        this.optional = [];
    }

    /**
   * Call this."``visit_`` + node class name" with `node` as
   * parameter.  If the ``visit_...`` method does not exist, call
   * this.unknown_visit.
   */
    public dispatchVisit(node: NodeInterface): {} | undefined | void {
        const nodeName = node.tagname;
        const methodName = `visit_${nodeName}`;
        // @ts-ignore
        let method = (this)[methodName];
        if (!method) {
            method = this.unknownVisit;
        }
        this.document.reporter.debug(`docutils.nodes.NodeVisitor.dispatch_visit calling for ${nodeName}`);
        return method.bind(this)(node);
    }

    /*
   * Call this."``depart_`` + node class name" with `node` as
   * parameter.  If the ``depart_...`` method does not exist, call
   * this.unknown_departure.
   */
    public dispatchDeparture(node: NodeInterface): {} | undefined | void {
        const nodeName = node.tagname;
        // @ts-ignore
        const method = (this)[`depart_${nodeName}`] || this.unknownDeparture;
        this.document.reporter.debug(
            `docutils.nodes.NodeVisitor.dispatch_departure calling for ${node}`
        );
        return method.bind(this)(node);
    }

    /**
   * Called when entering unknown `Node` types.
   *
   * Raise an exception unless overridden.
   */
    public unknownVisit(node: NodeInterface): never | void {
        if (this.strictVisitor || !(this.optional.includes(node.tagname))) {
            throw new Error(`visiting unknown node type:${node.tagname}`);
        }
    }

    /**
   * Called before exiting unknown `Node` types.
   *
   * Raise exception unless overridden.
   */
    public unknownDeparture(node: NodeInterface): never | void {
        if (this.strictVisitor || !(this.optional.includes(node.tagname))) {
            throw new Error(`departing unknown node type: ${node.tagname}`);
        }
    }
}

/**
 * Base class for sparse traversals, where only certain node types are of
 * interest.  When ``visit_...`` & ``depart_...`` methods should be
 * implemented for *all* node types (such as for `docutils.writers.Writer`
 * subclasses), subclass `NodeVisitor` instead.
 */
class SparseNodeVisitor extends NodeVisitor {
}

/**
 *  Generic "Visitor" abstract superclass, for simple traversals.
 *
 *  Unless overridden, each ``visit_...`` method calls `default_visit()`, and
 *  each ``depart_...`` method (when using `Node.walkabout()`) calls
 *  `default_departure()`. `default_visit()` (and `default_departure()`) must
 *  be overridden in subclasses.
 *
 *  Define fully generic visitors by overriding `default_visit()` (and
 *  `default_departure()`) only. Define semi-generic visitors by overriding
 *  individual ``visit_...()`` (and ``depart_...()``) methods also.
 *
 *  `NodeVisitor.unknown_visit()` (`NodeVisitor.unknown_departure()`) should
 *  be overridden for default behavior.
 */
class GenericNodeVisitor extends NodeVisitor {
    public static nodeClassNames = [];

    public constructor(document: Document) {
        super(document);
        // document this/
        _addNodeClassNames(nodeClassNames, this);
    }

    /* eslint-disable-next-line */
  public default_visit(node: NodeInterface) {
        throw new Error("not implemented");
    }

    /* eslint-disable-next-line */
  public default_departure(node: NodeInterface) {
        throw new Error("not implemented");
    }
}

// fixme
// GenericNodeVisitor.nodeClassNames = nodeClassNames;

// ========
//  Mixins
// ========

class Resolvable {
//    resolved = 0
}

class BackLinkable {
    public backrefs: string[] = [];

    public addBackref(refid: string): void {
        this.backrefs.push(refid);
    }
}

// ====================
//  Element Categories
// ====================

class Root {
}

class Titular {
}

/**
 * Category of Node which may occur before Bibliographic Nodes.
 */
class PreBibliographic {
}

class Bibliographic {
}

class Decorative extends PreBibliographic {
}

class Structural {
}

class Body {
}

class General extends Body {
}

/** List-like elements. */
class Sequential extends Body {
}

class Admonition extends Body {
}

/** Special internal body elements.  */
class Special extends Body {
}

/** Internal elements that don't appear in output. */
class Invisible extends PreBibliographic {
}

class Part {
}

class Inline {
}

class Referential extends Resolvable {
}

class Targetable extends Resolvable {
    // referenced = 0
    // indirect_reference_name = null
    /* Holds the whitespace_normalized_name (contains mixed case) of a target.
  Required for MoinMoin/reST compatibility.
  */
}

/** Contains a `label` as its first element. */
class Labeled {
}

// ==============================
//  Functional Node: NodeInterface Base Classes
// ==============================


/**
 * Node class.
 *
 * The base class for all docutils nodes.
 */


abstract class Node implements NodeInterface {
    /**
   * List attributes which are defined for every Element-derived class
   * instance and can be safely transferred to a different node.
   */
    public basicAttributes: string[] = ["ids", "classes", "names", "dupnames"];

    /**
   * List attributes, automatically initialized to empty lists for
   * all nodes.
   */
    public listAttributes: string[] = [];

    /** List attributes that are known to the Element base class. */
    public knownAttributes: string[] = [];

    public childTextSeparator: string = "";

    public abstract emptytag(): string;

    public referenced: boolean = false;

    public names: string[] = [];

    public refname?: string;

    public refid?: string;

    public currentSource: string = "";

    public currentLine: number = 0;

    public rawsource: string = "";

    public tagname: string;

    public parent?: NodeInterface;

    public document?: Document;

    public source: string|undefined;

    public line: number | undefined = 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public classTypes: any[] = [];

    public children: NodeInterface[] = [];

    public attributes: Attributes = {};

    /**
   * Create a node
   */
    public constructor() {
        this.tagname = this.constructor.name;
        this.classTypes = [];
        this._init();
    }

    public _init(): void {
    }


    /**
   Return the first node in the iterable returned by traverse(),
   or None if the iterable is empty.

   Parameter list is the same as of traverse.  Note that
   include_self defaults to 0, though.
   */
    public nextNode(args: TraverseArgs): NodeInterface | undefined {
        const iterable = this.traverse(args);
        if (iterable.length) {
            return iterable[0];
        }
        return undefined;
    }

    public hasClassType(classType: {}): boolean {
        // @ts-ignore
        return this.classTypes.findIndex((c): boolean => c.prototype instanceof classType
      || c === classType) !== -1;
    }

    public isInline(): boolean {
        // @ts-ignore
        return this.classTypes.findIndex((c: {}): boolean => c.prototype instanceof Inline || c === Inline) !== -1;
    }

    public isAdmonition(): boolean {
        return this.classTypes.findIndex(
            (c): boolean => c.prototype instanceof Admonition || c === Admonition
        ) !== -1;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unused-vars
    public asDOM(dom: {}): {} {
        return {};
    }

    abstract pformat(indent: string, level: number): string;

    abstract astext(): string;

    abstract copy(): NodeInterface;

    abstract deepcopy(): NodeInterface;

    abstract _domNode(domroot: {}): {};

    public setupChild(child: NodeInterface): void {
        child.parent = this;
        if (this.document) {
            child.document = this.document;
            if (child.source == null) {
                child.source = this.document.currentSource;
            }
            if (child.line == null) {
                child.line = this.document.currentLine;
            }
        }
    }

    /**
   * Traverse a tree of `Node` objects, calling the
   * `dispatch_visit()` method of `visitor` when entering each
   * node.  (The `walkabout()` method is similar, except it also
   * calls the `dispatch_departure()` method before exiting each
   * node.)
   *
   * This tree traversal supports limited in-place tree
   * modifications.  Replacing one node with one or more nodes is
   * OK, as is removing an element.  However, if the node removed
   * or replaced occurs after the current node, the old node will
   * still be traversed, and any new nodes will not.
   *
   * Within ``visit`` methods (and ``depart`` methods for
   * `walkabout()`), `TreePruningException` subclasses may be raised
   * (`SkipChildren`, `SkipSiblings`, `SkipNode`, `SkipDeparture`).
   *
   * Parameter `visitor`: A `NodeVisitor` object, containing a
   * ``visit`` implementation for each `Node` subclass encountered.
   *
   * Return true if we should stop the traversal.
   */
    public walk(visitor: Visitor): boolean {
        let stop = false;
        visitor.document.reporter.debug("docutils.nodes.Node.walk calling dispatch_visit for fixme");
        try {
            try {
                visitor.dispatchVisit(this);
            } catch (error) {
                if (error instanceof SkipChildren || error instanceof SkipNode) {
                    return stop;
                }
                if (error instanceof SkipDeparture) {
                    // do nothing
                }
                throw error;
            }
            const children = [...this.children];
            let skipSiblings = false;
            children.forEach((child): void => {
                try {
                    if (!stop && !skipSiblings) {
                        if (child.walk(visitor)) {
                            stop = true;
                        }
                    }
                } catch (error) {
                    if (error instanceof SkipSiblings) {
                        skipSiblings = true;
                    } else {
                        throw error;
                    }
                }
            });
        } catch (error) {
            if (error instanceof StopTraversal) {
                stop = true;
            }
            throw error;
        }
        return stop;
    }

    public walkabout(visitor: Visitor): boolean {
        let callDepart = true;
        let stop = false;
        visitor.document.reporter.debug("docutils.nodes.Node.walkabout calling dispatch_visit");
        try {
            try {
                visitor.dispatchVisit(this);
            } catch (error) {
                if (error instanceof SkipNode || error instanceof SkipChildren) {
                    return stop;
                }
                if (error instanceof SkipDeparture) {
                    callDepart = false;
                } else {
                    throw error;
                }
            }

            const { children } = this;
            try {
                /* eslint-disable-next-line no-restricted-syntax */
                for (const child of [...children]) {
                    // console.log(typeof child);
                    // console.log(Object.keys(child));
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
                `docutils.nodes.Node.walkabout calling dispatch_departure for ${this}`
            );
            visitor.dispatchDeparture(this);
        }
        return stop;
    }

    public _fastTraverse(cls: FastTraverseArg): NodeInterface[] {
    // Specialized traverse() that only supports instance checks.
        const result = [];
        if (this instanceof cls) {
            result.push(this);
        }
        const myNode = this;
        myNode.children.forEach((child): void => {
            if (typeof child === "undefined") {
                throw new Error("child is undefined");
            }
            // @ts-ignore
            // eslint-disable-next-line no-underscore-dangle
            if (typeof child._fastTraverse === "undefined") {
                throw new Error(`${child} does not have _fastTraverse`);
            }
            // @ts-ignore
            result.push(...child._fastTraverse(cls));
        });
        return result;
    }

    public _allTraverse(): NodeInterface[] {
    // Specialized traverse() that doesn't check for a condition.
        const result: NodeInterface[] = [];
        result.push(this);
        this.children.forEach((child): void => {
            // @ts-ignore
            // eslint-disable-next-line no-underscore-dangle
            result.push(...child._allTraverse());
        });
        return result;
    }

    public traverse(args: TraverseArgs): NodeInterface[] {
        const {
            condition, includeSelf = true, descend = true, siblings = false, ascend = false
        } = args;
        const mySiblings = ascend ? true : siblings;
        if (includeSelf && descend && !mySiblings) {
            if (!condition) {
                // eslint-disable-next-line no-underscore-dangle
                return this._allTraverse();
                // eslint-disable-next-line no-underscore-dangle
            }
            // @ts-ignore
            if ((condition.prototype instanceof Node) || condition === Node) {
                // @ts-ignore
                return this._fastTraverse(condition);
            }
        }
        if (typeof condition !== "undefined" && (condition.prototype instanceof Node || condition === Node)) {
            const nodeClass = condition;
            /* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
            const myCondition = (node: Node, nodeClassArg: NodeClass): boolean => (
                (node instanceof nodeClassArg) || (node instanceof nodeClass)
            );
            throw new Error("unimplemented");
        }
        /*
    if isinstance(condition, (types.ClassType, type)):
        node_class = condition
        def condition(node, node_class=node_class):
            return isinstance(node, node_class)
*/
        const r: NodeInterface[] = [];
        // @ts-ignore
        if (includeSelf && (condition == null || condition(this))) {
            r.push(this);
        }
        if (descend && this.children.length) {
            this.children.forEach((child): void => {
                r.push(...child.traverse({
                    includeSelf: true,
                    descend: true,
                    siblings: false,
                    ascend: false,
                    condition
                }));
            });
        }
        if (siblings || ascend) {
            let node: NodeInterface | undefined = (this as NodeInterface);
            while (node != null && node.parent != null) {
                const index = node.parent.children.indexOf(node);
                node.parent.children.slice(index + 1).forEach((sibling): void => {
                    r.push(...sibling.traverse({
                        includeSelf: true,
                        descend,
                        siblings: false,
                        ascend: false,
                        condition
                    }));
                });
                if (!ascend) {
                    node = undefined;
                } else {
                    node = node.parent;
                }
            }
        }
        return r;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public add(iNodes: NodeInterface[] | NodeInterface): void {
        throw new UnimplementedError("");
    }


    public endtag(): string {
        return "";
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public starttag(quoteattr?: QuoteattrCallback): string {
        return "";
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public addBackref(prbid: {}): void {
    }

    public updateBasicAtts(dict_: Attributes): void {
        const dict2 = dict_ instanceof Node ? dict_.attributes : dict_;
        this.basicAttributes.forEach((att): void => {
            // @ts-ignore
            const v = att in dict2 ? dict2[att] : [];
            this.appendAttrList(att, v);
        });
    }

    public appendAttrList(attr: string, values: (string|{})[]): void {
    // List Concatenation
        values.forEach((value): void => {
            if ((this.attributes[attr].filter((v: {}): boolean => v === value)).length === 0) {
                this.attributes[attr].push(value);
            }
        });
    }

    public replaceAttr(attr: string, value: (string|{})[] | string | {}, force = true): void {
    // One or the other
        if (force || this.attributes[attr] == null) {
            this.attributes[attr] = value;
        }
    }

    public copyAttrConsistent(attr: string, value: (string|{}), replace?: boolean): void {
        if (this.attributes[attr] !== value) {
            this.replaceAttr(attr, value, replace);
        }
    }

    public updateAllAtts(
        dict_: Attributes,
        updateFun = this.copyAttrConsistent,
        replace = true,
        andSource = false
    ): void {
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
        atts.forEach((att): void => {
            updateFun.bind(this)(att, dict2[att], replace);
        });
    }

    /**
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
   */
    public updateAllAttsConcatenating(dict_: Attributes, replace: boolean = true, andSource: boolean = false): void {
        this.updateAllAtts(dict_, this.copyAttrConcatenate, replace,
            andSource);
    }

    /**
   Returns True if and only if the given attribute is NOT one of the
   basic list attributes defined for all Elements.
   */
    public isNotListAttribute(attr: string): boolean {
        return !(attr in this.listAttributes);
    }

    /**
   Returns True if and only if the given attribute is NOT recognized by
   this class.
   */
    public isNotKnownAttribute(attr: string): boolean {
        return !(attr in this.knownAttributes);
    }

    public copyAttrConcatenate(attr: string, value: string | string[], replace?: boolean): void {
    /*
      """
      If attr is an attribute of self and both self[attr] and value are
      lists, concatenate the two sequences, setting the result to
      self[attr].  If either self[attr] or value are non-sequences and
      replace is True or self[attr] is None, replace self[attr] with value.
          Otherwise, do nothing.
          """ */
        if (this.attributes[attr] !== value) {
            if (Array.isArray(this.attributes[attr]) && Array.isArray(value)) {
                this.appendAttrList(attr, value);
            } else {
                this.replaceAttr(attr, value, replace);
            }
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public getCustomAttr(attrName: string): undefined {
        return undefined;
    }
}

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
 *  This is equivalent to ``element.append(node: NodeInterface)``.
 *
 *  To add a list of multiple child nodes at once, use the same ``+=``
 *  operator::
 *
 *      element += [node1, node2]
 *
 *  This is equivalent to ``element.extend([node1, node2])``.
 *
 * @extends module:nodes~Node
 */
class Element extends Node implements ElementInterface {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public nodeName: any;


    /**
   * A list of class-specific attributes that should not be copied with the
   * standard attributes when replacing a node.
   *
   * NOTE: Derived classes should override this value to prevent any of its
   * attributes being copied by adding to the value in its parent class.
   */
    public localAttributes: string[] = ["backrefs"];


    /**
   * The element generic identifier. If None, it is set as an instance
   * attribute to the name of the class.
   */
    public tagname: string = "";

    public attributes: Attributes;


    /**
   * Create element.
   * @classdesc Abstracts a docutils Element.
   * @extends module:nodes~Node
   */
    public constructor(rawsource?: string, children: NodeInterface[] = [], attributes: Attributes = {}) {
        super();
        this.nodeName = Symbol.for("Element");
        this.children = children; // we want to do this, imo
        this.attributes = {};
        this.listAttributes.forEach((x): void => {
            this.attributes[x] = [];
        });
        Object.keys(attributes).forEach((att): void => {
            const value: string| string[] = attributes[att];
            const attKey = att.toLowerCase();

            /* This if path never taken... why? FIXME */
            if (attKey in this.listAttributes) {
                /* istanbul ignore next */
                if (!isIterable(value)) {
                    throw new Error();
                }
                // @ts-ignore
                const a: string[] = value;
                this.attributes[attKey] = [...a];
            } else {
                this.attributes[attKey] = value;
            }
        });
        this.tagname = this.constructor.name;
    }

    public _init(): void {
        super._init();
        /* List attributes which are defined for every Element-derived class
       instance and can be safely transferred to a different node. */
        this.basicAttributes = ["ids", "classes", "names", "dupnames"];
        /*
      "A list of class-specific attributes that should not be copied with the
      standard attributes when replacing a node.

      NOTE: Derived classes should override this value to prevent any of its
      attributes being copied by adding to the value in its parent class.
    */
        this.localAttributes = ["backrefs"];

        /* List attributes, automatically initialized to empty lists
       for all nodes. */
        this.listAttributes = [...this.basicAttributes, ...this.localAttributes];

        /* List attributes that are known to the Element base class. */
        this.knownAttributes = [...this.listAttributes, "source", "rawsource"];

        /* The element generic identifier. If None, it is set as an
       instance attribute to the name of the class. */
        // this.tagname = undefined; (already set in Node.constructor)

        /* Separator for child nodes, used by `astext()` method. */
        this.childTextSeparator = "\n\n";
    }


    public _domNode(domroot: {}): {}{
        // @ts-ignore
        const element = domroot.createElement(this.tagname);
        const l = this.attlist();
        Object.keys(l).forEach((attribute): void => {
            // @ts-ignore
            const value: string | string[] = l[attribute];
            let myVal: string;
            if (Array.isArray(value)) {
                myVal = value.map((v): string => serialEscape(v.toString())).join(" ");
            } else {
                myVal = value.toString();
            }
            element.setAttribute(attribute, myVal);
        });
        this.children.forEach((child): void => {
            // @ts-ignore
            // eslint-disable-next-line no-underscore-dangle
            element.appendChild(child._domNode(domroot));
        });
        return element;
    }

    public emptytag(): string {
        return `<${[this.tagname, ...Object.entries(this.attlist())
            .map(([n, v]): string => `${n}="${v}"`)].join(" ")}/>`;
    }


    public astext(): string {
        return this.children.map((x): string => x.astext()).join(this.childTextSeparator);
    }

    public extend(...items: {}[]): void {
        // @ts-ignore
        items.forEach(this.append.bind(this));
    }

    public append(item: NodeInterface): void {
        this.setupChild(item);
        this.children.push(item);
    }

    public add(item: NodeInterface[] | NodeInterface): void {
        if (Array.isArray(item)) {
            this.extend(...item);
        } else {
            this.append(item);
        }
    }

    public setupChild(child: NodeInterface): void {
    /* istanbul ignore if */
        if (!(child instanceof Node)) {
            throw new InvalidArgumentsError(`Expecting node instance ${child}`);
        }

        /* istanbul ignore if */
        if (!child) {
            throw new InvalidArgumentsError("need child");
        }

        child.parent = this;
        if (this.document) {
            child.document = this.document;
            if (typeof child.source === "undefined") {
                child.source = this.document.currentSource;
            }
            if (typeof child.line === "undefined") {
                child.line = this.document.currentLine;
            }
        }
    }

    public starttag(quoteAttr?: QuoteattrCallback): string {
        const q = quoteAttr || pseudoQuoteattr;

        const parts = [this.tagname];
        const attlist = this.attlist();
        Object.keys(attlist).forEach((name): void => {
            const value: string | string[] = attlist[name];

            let myVal = value;
            let gotPart = false;
            if (myVal === undefined) {
                parts.push(`${name}="True"`);
                gotPart = true;
            } else if (Array.isArray(myVal)) {
                const values = myVal.map((v: string): string => serialEscape(v.toString()));
                myVal = values.join(" ");
            } else {
                myVal = value.toString();
            }
            if (!gotPart) {
                myVal = q(myVal);
                parts.push(`${name}=${myVal}`);
            }
        });
        return `<${parts.join(" ")}>`;
    }

    public endtag(): string {
        return `</${this.tagname}>`;
    }

    public attlist(): Attributes {
        const attlist = this.nonDefaultAttributes();
        return attlist;
    }

    public nonDefaultAttributes(): Attributes {
        const atts: Attributes = {};
        Object.entries(this.attributes).forEach(([key, value]): void => {
            if (this.isNotDefault(key)) {
                atts[key] = value;
            }
        });
        return atts;
    }

    public isNotDefault(key: string): boolean {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public firstChildNotMatchingClass(childClass: any | any[], start = 0, end = this.children.length): number | undefined {
        const myChildClass = Array.isArray(childClass) ? childClass : [childClass];
        const r = this.children.slice(start,
            Math.min(this.children.length, end))
            .findIndex((child, index): boolean => {
                if (myChildClass.findIndex((c): boolean => {
                    // if (typeof child === 'undefined') {
                    //     throw new Error(`child should not be undefined, index ${index}`);
                    // }
                    if (child instanceof c
            || (this.children[index].classTypes.filter(
                // @ts-ignore
                ((c2): boolean => c2.prototype instanceof c || c2 === c)
            ))
                .length) {
                        return true;
                    }
                    return false;
                }) === -1) {
                    // console.log(`returning index ${index} ${nodeToXml(this.children[index])}`);
                    return true;
                }
                return false;
            });

        if (r !== -1) {
            return r;
        }
        return undefined;
    }

    public pformat(indent: string, level: number): string {
        return `${indent.repeat(level)}${this.starttag()}\n${this.children.map((c): string => c.pformat(indent, level + 1)).join("")}`;
    }

    public copy(): NodeInterface {
    // @ts-ignore
        return new this.constructor(this.rawsouce, this.children, this.attributes);
    }

    public deepcopy(): NodeInterface {
        return this.copy();
    }

    /*
    Update basic attributes ('ids', 'names', 'classes',
    'dupnames', but not 'source') from node or dictionary `dict_`.
  */

    /*
  For each element in values, if it does not exist in self[attr], append
  it.

  NOTE: Requires self[attr] and values to be sequence type and the
  former should specifically be a list.
*/

    /*
  If self[attr] does not exist or force is True or omitted, set
  self[attr] to value, otherwise do nothing.
*/

    /*
  If replace is true or this.attributes[attr] is null, replace
  this.attributes[attr] with value.  Otherwise, do nothing.
*/

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
    /** Note that this Element has been referenced by its name
   `name` or id `id`. */
    public noteReferencedBy(name: string, id: string): void {
        this.referenced = true;
        const byName = this.attributes.expect_referenced_by_name[name];
        const byId = this.attributes.expect_referenced_by_name[id];
        if (byName != null) {
            byName.referenced = true;
        }
        if (byId != null) {
            byId.referenced = 1;
        }
    }
}

// =====================
//  Decorative Elements
// =====================
// eslint-disable-next-line @typescript-eslint/class-name-casing
class header extends Element {
    public constructor(rawsource?: string, children?: NodeInterface[], attributes?: Attributes) {
        super(rawsource, children, attributes);
        this.classTypes = [Decorative];
    }
}
// eslint-disable-next-line @typescript-eslint/class-name-casing
class footer extends Element {
    public constructor(rawsource?: string, children: NodeInterface[] = [], attributes: Attributes = {}) {
        super(rawsource, children, attributes);
        this.classTypes = [Decorative];
    }
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
class decoration extends Element {
    public constructor(rawsource?: string, children: NodeInterface[] = [], attributes: Attributes = {}) {
        super(rawsource, children, attributes);
        this.classTypes = [Decorative];
    }

    public getHeader(): NodeInterface {
        if (!this.children.length || !(this.children[0] instanceof header)) {
            this.children.splice(0, 0, new header());
        }
        return this.children[0];
    }

    public getFooter(): NodeInterface {
        if (!this.children.length || !(this.children[this.children.length - 1] instanceof footer)) {
            this.add(new footer());
        }
        return this.children[this.children.length - 1];
    }
}

class Text extends Node {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public pformat(indent: string, level: number): string {
        throw new Error("Method not implemented.");
    }

    public copy(): NodeInterface {
        return this.constructor(this.data, this.rawsource);
    }

    public deepcopy(): NodeInterface {
        return this.copy();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public walk(visitor: Visitor): boolean {
        throw new Error("Method not implemented.");
    }

    private data: string;

    public constructor(data: string, rawsource = "") {
        super();
        if (typeof data === "undefined") {
            throw new Error("data should not be undefined");
        }

        this.rawsource = rawsource;
        this.data = data;
        this.children = [];
    }

    public _domNode(domroot: {}): {} {
        // @ts-ignore
        return domroot.createTextNode(this.data);
    }

    public astext(): string {
        return unescape(this.data);
    }

    public toString(): string {
        return this.astext();
    }

    public toSource(): string {
        return this.toString();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars
    public add(iNodes: NodeInterface[] | NodeInterface): void {
        throw new UnimplementedError("");
    }

    public document?: Document;
    public parent?: NodeInterface;
    public refid?: string;
    public refname?: string;

    public emptytag(): string {
        return "";
    }
}

class TextElement extends Element implements TextElementInterface {
    public constructor(
        rawsource?: string,
        text?: string,
        children?: NodeInterface[],
        attributes?: Attributes
    ) {
        const cAry = children || [];
        /* istanbul ignore if */
        if (Array.isArray(text)) {
            throw new InvalidArgumentsError("text should not be an array");
        }
        super(rawsource, (typeof text !== "undefined" && text !== "") ? [new Text(text), ...cAry] : cAry, attributes);
    }
}

export interface TransformerInterface {
    addPending(pending: NodeInterface, priority: number): void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface NameTypes {
    [name: string]: boolean;
}

interface Ids {
    [id: string]: NodeInterface ;
}

interface RefNames {
    [refName: string]: NodeInterface[];
}

interface RefIds {
    [refId: string]: NodeInterface[];
}

interface SubstitutionNames {
    [name: string]: string;
}

interface SubstitutionDefs {
    // eslint-disable-next-line @typescript-eslint/camelcase
    [name: string]: substitution_definition;
}

/**
 * Document class
 *
 * To create a document, call {@link newDocument}.
 * @extends Element
 */
// eslint-disable-next-line @typescript-eslint/class-name-casing
class document extends Element implements Document {
    public settings: Settings;

    public reporter: ReporterInterface;

    public decoration?: decoration;

    public transformMessages: Systemmessage[];

    public parseMessages: Systemmessage[];

    public transformer: Transformer;

    private substitutionDefs: SubstitutionDefs;

    private substitutionNames: SubstitutionNames;

    private citationRefs: RefNames;

    private citations: NodeInterface[];

    private footnoteRefs: RefNames;

    private autofootnoteRefs: NodeInterface[];

    private symbolFootnotes: NodeInterface[];

    private footnotes: NodeInterface[];

    private symbolFootnoteRefs: NodeInterface[];

    private indirectTargets: NodeInterface[];

    private autofootnotes: NodeInterface[];

    private refIds: RefIds;

    private refNames: RefNames;

    public nameIds: NameIds;

    private ids: Ids;

    private nameTypes: NameTypes;

    private idStart: number;

    private autofootnoteStart: number;

    private symbolFootnoteStart: number;
    private idPrefix: string = "";
    private autoIdPrefix: string = "";
    public uuid?: string;

    /** Private constructor */
    public constructor(
        settings: Settings,
        reporter: ReporterInterface,
        rawsource?: string,
        children?: NodeInterface[],
        attributes?: Attributes
    ) {
        super(rawsource, children, attributes);
        this.classTypes = [Root, Structural];
        this.tagname = "document";
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
        this.parseMessages = [];
        this.transformMessages = [];
        this.transformer = new Transformer(this);
        this.decoration = undefined;
        this.document = this;
    }

    public setId(node: NodeInterface, msgnode?: NodeInterface): string {
        let msg;
        let id = '';
        node.attributes.ids.forEach((myId: string): void => {
            if (myId in this.ids && this.ids[myId] !== node) {
                msg = this.reporter.severe(`Duplicate ID: "${myId}".`);
                if (msgnode !== undefined && msg !== undefined) {
                    msgnode.add(msg);
                }
            }
        });
        if (node.attributes.ids.length === 0) {
            let name;
            let myBreak = false;
            /* eslint-disable-next-line no-restricted-syntax */
            for (name of node.attributes.names) {
                id = this.idPrefix + makeId(name);
                if (id && this.attributes.ids.indexOf(id) === -1) {
                    myBreak = true;
                    break;
                }
            }
            if (!myBreak) {
                id = "";
                while (!id || (id in this.attributes.ids)) {
                    id = (this.idPrefix + this.autoIdPrefix
            + this.idStart);
                    this.idStart += 1;
                }
            }
            node.attributes.ids.push(id);
        }
        this.ids[id] = node;
        return id;
    }

    public setNameIdMap(node: NodeInterface, id: string, msgnode: NodeInterface, explicit?: boolean): void {
        node.attributes.names.forEach((name: string): void => {
            if (name in this.nameIds) {
                this.setDuplicateNameId(node, id, name, msgnode, explicit);
            } else {
                this.nameIds[name] = id;
                this.nameTypes[name] = explicit || false;
            }
        });
    }

    public setDuplicateNameId(node: NodeInterface, id: string, name: string, msgnode: NodeInterface, explicit?: boolean): void {
        const oldId = this.nameIds[name];
        const oldExplicit = this.nameTypes[name];
        this.nameTypes[name] = oldExplicit || explicit || false;
        let oldNode;
        if (explicit) {
            if (oldExplicit) {
                let level = 2;
                if (oldId != null) {
                    oldNode = this.ids[oldId];
                    if ("refuri" in node.attributes) {
                        const { refuri } = node.attributes;
                        if (oldNode.attributes.names.length
              && "refuri" in oldNode.attributes
              && oldNode.attributes.refuri === refuri) {
                            level = 1; // just inform if refuri's identical
                        }
                    }
                    if (level > 1) {
                        dupname(oldNode, name);
                        // worth seeing if the same behavior can be obtained
                        // via deletion
                        this.nameIds[name] = undefined;
                    }
                }
                const msg = this.reporter.systemMessage(
                    level, `Duplicate explicit target name: "${name}".`,
                    // eslint-disable-next-line @typescript-eslint/camelcase
                    [], { backrefs: [id], base_node: node }
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
                this.nameIds[name] = undefined;
                oldNode = this.ids[oldId];
                dupname(oldNode, name);
            }
            dupname(node, name);
        }
        if (!explicit || (!oldExplicit && oldId != null)) {
            const msg = this.reporter.info(
                `Duplicate implicit target name: "${name}".`, [],
                // eslint-disable-next-line @typescript-eslint/camelcase
                { backrefs: [id], base_node: node }
            );
            if (msgnode != null && msg !== undefined) {
                msgnode.add(msg);
            }
        }
    }

    public hasName(name: string): boolean {
        return Object.keys(this.nameIds).includes(name);
    }

    public noteImplicitTarget(target: NodeInterface, msgnode: NodeInterface): void {
        const id = this.setId(target, msgnode);
        this.setNameIdMap(target, id, msgnode);
    }

    public noteExplicitTarget(target: NodeInterface, msgnode?: NodeInterface): void {
        if(msgnode !== undefined) {
            const id = this.setId(target, msgnode);
            this.setNameIdMap(target, id, msgnode, true);
        }
    }

    public noteRefname(node: NodeInterface): void {
        if(node === undefined || node.refname === undefined) {
            throw new InvalidStateError();
        }
        const a = [node];
        if (this.refNames[node.refname]) {
            this.refNames[node.refname].push(node);
        } else {
            this.refNames[node.refname] = a;
        }
    }

    public noteRefId(node: NodeInterface): void | never {
        if(node === undefined || node.refid === undefined) {
            throw new InvalidStateError();
        }
        const a = [node];
        if (this.refIds[node.refid]) {
            this.refIds[node.refid].push(node);
        } else {
            this.refIds[node.refid] = a;
        }
    }

    public noteIndirectTarget(target: NodeInterface): void {
        this.indirectTargets.push(target);
        // check this fixme
        if (target.names) {
            this.noteRefname(target);
        }
    }

    public noteAnonymousTarget(target: NodeInterface): void {
        this.setId(target);
    }

    public noteAutofootnote(footnote: NodeInterface): void {
        this.setId(footnote);
        this.autofootnotes.push(footnote);
    }

    public noteAutofootnoteRef(ref: NodeInterface): void {
        this.setId(ref);
        this.autofootnoteRefs.push(ref);
    }

    public noteSymbolFootnote(footnote: NodeInterface): void {
        this.setId(footnote);
        this.symbolFootnotes.push(footnote);
    }

    public noteSymbolFootnoteRef(ref: NodeInterface): void {
        this.setId(ref);
        this.symbolFootnoteRefs.push(ref);
    }

    public noteFootnote(footnote: NodeInterface): void {
        this.setId(footnote);
        this.footnotes.push(footnote);
    }

    public noteFootnoteRef(ref: NodeInterface): void {
        if(ref === undefined || ref.refname === undefined) {
            throw new InvalidStateError();
        }
        this.setId(ref);
        const a = [ref];
        if (this.footnoteRefs[ref.refname]) {
            this.footnoteRefs[ref.refname].push(ref);
        } else {
            this.footnoteRefs[ref.refname] = a;
        }
        this.noteRefname(ref);
    }

    public noteCitation(citation: NodeInterface): void {
        this.citations.push(citation);
    }

    public noteCitationRef(ref: NodeInterface): void | never {
        if(ref === undefined || ref.refname === undefined) {
            throw new InvalidStateError();
        }
        this.setId(ref);
        if (this.citationRefs[ref.refname]) {
            this.citationRefs[ref.refname].push(ref);
        } else {
            this.citationRefs[ref.refname] = [ref];
        }
        this.noteRefname(ref);
    }

    // eslint-disable-next-line @typescript-eslint/camelcase
    public noteSubstitutionDef(subdef: substitution_definition, defName: string, msgnode: NodeInterface): void {
        const name = whitespaceNormalizeName(defName);
        if (Object.keys(this.substitutionDefs).includes(name)) {
            const msg = this.reporter.error(`Duplicate substitution definition name: "${name}".`, [],
                { baseNode: subdef });
            if (msgnode != null && msg !== undefined) {
                msgnode.add(msg);
            }
            const oldnode = this.substitutionDefs[name];
            dupname(oldnode, name);
        }
        this.substitutionDefs[name] = subdef;
        this.substitutionNames[fullyNormalizeName(name)] = name;
    }

    public noteSubstitutionRef(subref: NodeInterface, refname: string): void {
        subref.refname = whitespaceNormalizeName(refname);
    }

    public notePending(pending: NodeInterface, priority: number): void {
        this.transformer.addPending(pending, priority);
    }

    public noteParseMessage(message: Systemmessage): void {
        this.parseMessages.push(message);
    }

    public noteTransformMessage(message: Systemmessage): void {
        this.transformMessages.push(message);
    }

    public noteSource(source: string, offset: number): void {
        this.currentSource = source;
        if (offset === undefined) {
            this.currentLine = offset;
        } else {
            this.currentLine = offset + 1;
        }
    }

    public getDecoration(): decoration {
        if (!this.decoration) {
            this.decoration = new decoration();
            const index = this.firstChildNotMatchingClass(Titular);
            if (index === undefined) {
                this.children.push(this.decoration);
            } else {
                this.children.splice(index, 0, this.decoration as NodeInterface);
            }
        }
        return this.decoration;
    }
}

class FixedTextElement extends TextElement {
    /*    def __init__(self, rawsource='', text='', *children, **attributes):
          TextElement.__init__(self, rawsource, text, *children, **attributes)
          self.attributes['xml:space'] = 'preserve'
  */
}

// ================
//  Title Elements
// ================
// eslint-disable-next-line @typescript-eslint/class-name-casing
class title extends TextElement {
    /* eslint-disable-next-line no-useless-constructor */

    public constructor(rawsource?: string, text?: string, children: NodeInterface[] = [], attributes: Attributes = {}) {
        super(rawsource, text, children, attributes);
        this.classTypes = [Titular, PreBibliographic];
    }
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
class subtitle extends TextElement {
    /* eslint-disable-next-line no-useless-constructor */

    public constructor(rawsource?: string, text?: string, children: NodeInterface[] = [], attributes: Attributes = {}) {
        super(rawsource, text, children, attributes);
        this.classTypes = [Titular, PreBibliographic];
    }
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
class rubric extends TextElement {
    /* eslint-disable-next-line no-useless-constructor */

    public constructor(rawsource?: string, text?: string, children: NodeInterface[] = [], attributes: Attributes = {}) {
        super(rawsource, text, children, attributes);
        this.classTypes = [Titular];
    }
}

// ========================
//  Bibliographic Elements
// ========================

// eslint-disable-next-line @typescript-eslint/class-name-casing
class docinfo extends Element {
    public constructor(rawsource?: string, children: NodeInterface[] = [], attributes: Attributes = {}) {
        super(rawsource, children, attributes);
        this.classTypes = [Bibliographic];
    }
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
class author extends TextElement {
    public constructor(rawsource?: string, text?: string, children: NodeInterface[] = [], attributes: Attributes = {}) {
        super(rawsource, text, children, attributes);
        this.classTypes = [Bibliographic];
    }
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
class authors extends Element {
    public constructor(rawsource?: string, children?: NodeInterface[], attributes?: Attributes) {
        super(rawsource, children, attributes);
        this.classTypes = [Bibliographic];
    }
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
class organization extends TextElement {
    public constructor(rawsource?: string, text?: string, children: NodeInterface[] = [], attributes: Attributes = {}) {
        super(rawsource, text, children, attributes);
        this.classTypes = [Bibliographic];
    }
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
class address extends FixedTextElement {
    // @ts-ignore
    public constructor(...args) {
    // @ts-ignore
        super(...args);
        this.classTypes = [Bibliographic];
    }
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
class contact extends TextElement {
    public constructor(rawsource?: string, text?: string, children: NodeInterface[] = [], attributes: Attributes = {}) {
        super(rawsource, text, children, attributes);
        this.classTypes = [Bibliographic];
    }
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
class version extends TextElement {
    public constructor(rawsource?: string, text?: string, children: NodeInterface[] = [], attributes: Attributes = {}) {
        super(rawsource, text, children, attributes);
        this.classTypes = [Bibliographic];
    }
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
class revision extends TextElement {
    public constructor(rawsource?: string, text?: string, children: NodeInterface[] = [], attributes: Attributes = {}) {
        super(rawsource, text, children, attributes);
        this.classTypes = [Bibliographic];
    }
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
class status extends TextElement {
    public constructor(rawsource?: string, text?: string, children: NodeInterface[] = [], attributes: Attributes = {}) {
        super(rawsource, text, children, attributes);
        this.classTypes = [Bibliographic];
    }
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
class date extends TextElement {
    public constructor(rawsource?: string, text?: string, children: NodeInterface[] = [], attributes: Attributes = {}) {
        super(rawsource, text, children, attributes);
        this.classTypes = [Bibliographic];
    }
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
class copyright extends TextElement {
    public constructor(rawsource?: string, text?: string, children: NodeInterface[] = [], attributes: Attributes = {}) {
        super(rawsource, text, children, attributes);
        this.classTypes = [Bibliographic];
    }
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
class section extends Element {
    /* eslint-disable-next-line no-useless-constructor */

    public constructor(rawsource?: string, children: NodeInterface[] = [], attributes: Attributes = {}) {
        super(rawsource, children, attributes);
        this.classTypes = [Structural];
    }
}

/**
 *  Topics are terminal, "leaf" mini-sections, like block quotes with titles,
 *  or textual figures.  A topic is just like a section, except that it has no
 *  subsections, and it doesn't have to conform to section placement rules.
 *
 *  Topics are allowed wherever body elements (list, table, etc.) are allowed,
 *  but only at the top level of a section or document.  Topics cannot nest
 *  inside topics, sidebars, or body elements; you can't have a topic inside a
 *  table, list, block quote, etc.
 */
// eslint-disable-next-line @typescript-eslint/class-name-casing
class topic extends Element {
    public constructor(rawsource?: string, children?: NodeInterface[], attributes?: Attributes) {
        super(rawsource, children, attributes);
        this.classTypes = [Structural];
    }
}

/*
 *  Sidebars are like miniature, parallel documents that occur inside other
 *  documents, providing related or reference material.  A sidebar is
 *  typically offset by a border and "floats" to the side of the page; the
 *  document's main text may flow around it.  Sidebars can also be likened to
 *  super-footnotes; their content is outside of the flow of the document's
 *  main text.
 *
 *  Sidebars are allowed wherever body elements (list, table, etc.) are
 *  allowed, but only at the top level of a section or document.  Sidebars
 *  cannot nest inside sidebars, topics, or body elements; you can't have a
 *  sidebar inside a table, list, block quote, etc.
 */

// eslint-disable-next-line @typescript-eslint/class-name-casing
class sidebar extends Element {
    public constructor(rawsource?: string, children?: NodeInterface[], attributes?: Attributes) {
        super(rawsource, children, attributes);
        this.classTypes = [Structural];
    }
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
class transition extends Element {
    /* eslint-disable-next-line no-useless-constructor */

    public constructor(rawsource?: string, children?: NodeInterface[], attributes?: Attributes) {
        super(rawsource, children, attributes);
        this.classTypes = [Structural];
    }
} // Structural

// ===============
//  Body Elements
// ===============

// eslint-disable-next-line @typescript-eslint/class-name-casing
class paragraph extends TextElement {
    /* eslint-disable-next-line no-useless-constructor */

    public constructor(rawsource?: string, text?: string, children: NodeInterface[] = [], attributes: Attributes = {}) {
        super(rawsource, text, children, attributes);
        this.classTypes = [General];
    }
} // General

// eslint-disable-next-line @typescript-eslint/class-name-casing
class compound extends Element {
    public constructor(rawsource?: string, children?: NodeInterface[], attributes?: Attributes) {
        super(rawsource, children, attributes);
        this.classTypes = [General];
    }
}


// eslint-disable-next-line @typescript-eslint/class-name-casing
class container extends Element {
    public constructor(rawsource?: string, children?: NodeInterface[], attributes?: Attributes) {
        super(rawsource, children, attributes);
        this.classTypes = [General];
    }
}

/* eslint-disable-next-line @typescript-eslint/camelcase,camelcase,@typescript-eslint/class-name-casing */
class bullet_list extends Element {
    /* eslint-disable-next-line no-useless-constructor */
    public constructor(rawsource?: string, children?: NodeInterface[], attributes?: Attributes) {
        super(rawsource, children, attributes);
        this.classTypes = [Sequential];
    }
}

/* eslint-disable-next-line @typescript-eslint/camelcase,camelcase,@typescript-eslint/class-name-casing */
class enumerated_list extends Element {
    public start?: number;

    public suffix?: string;

    public prefix?: string;

    public enumtype: string = '';

    /* eslint-disable-next-line no-useless-constructor */

    public constructor(rawsource?: string, children?: NodeInterface[], attributes?: Attributes) {
        super(rawsource, children, attributes);
        this.classTypes = [Sequential];
    }
}

/* eslint-disable-next-line @typescript-eslint/camelcase,camelcase,@typescript-eslint/class-name-casing */
class list_item extends Element {
    /* eslint-disable-next-line no-useless-constructor */

    public constructor(rawsource?: string, children?: NodeInterface[], attributes?: Attributes) {
        super(rawsource, children, attributes);
        this.classTypes = [Part];
    }
}

/* eslint-disable-next-line @typescript-eslint/camelcase,camelcase,@typescript-eslint/class-name-casing */
class definition_list extends Element {
    /* eslint-disable-next-line no-useless-constructor */

    public constructor(rawsource?: string, children?: NodeInterface[], attributes?: Attributes) {
        super(rawsource, children, attributes);
        this.classTypes = [Sequential];
    }
}

/* eslint-disable-next-line @typescript-eslint/camelcase,camelcase,@typescript-eslint/class-name-casing */
class definition_list_item extends Element {
    /* eslint-disable-next-line no-useless-constructor */

    public constructor(rawsource?: string, children?: NodeInterface[], attributes?: Attributes) {
        super(rawsource, children, attributes);
        this.classTypes = [Part];
    }
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
class term extends TextElement {
    /* eslint-disable-next-line no-useless-constructor */

    public constructor(rawsource?: string, text?: string, children: NodeInterface[] = [], attributes: Attributes = {}) {
        super(rawsource, text, children, attributes);
        this.classTypes = [Part];
    }
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
class classifier extends TextElement {
    /* eslint-disable-next-line no-useless-constructor */

    public constructor(rawsource?: string, text?: string, children: NodeInterface[] = [], attributes: Attributes = {}) {
        super(rawsource, text, children, attributes);
        this.classTypes = [Part];
    }
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
class definition extends Element {
    /* eslint-disable-next-line no-useless-constructor */
    public constructor(rawsource?: string, children?: NodeInterface[], attributes?: Attributes) {
        super(rawsource, children, attributes);
        this.classTypes = [Part];
    }
}

/*
class classifier(Part, TextElement): pass
*/

/* eslint-disable-next-line @typescript-eslint/camelcase,camelcase,@typescript-eslint/class-name-casing */
class field_list extends Element {
    /* eslint-disable-next-line no-useless-constructor */

    public constructor(rawsource?: string, children?: NodeInterface[], attributes?: Attributes) {
        super(rawsource, children, attributes);
        this.classTypes = [Sequential];
    }
} // (Sequential, Element

// eslint-disable-next-line @typescript-eslint/class-name-casing
class field extends Element {
    /* eslint-disable-next-line no-useless-constructor */

    public constructor(rawsource?: string, children?: NodeInterface[], attributes?: Attributes) {
        super(rawsource, children, attributes);
        this.classTypes = [Part];
    }
} // (Part
/* eslint-disable-next-line @typescript-eslint/camelcase,camelcase,@typescript-eslint/class-name-casing */
class field_name extends TextElement {
    /* eslint-disable-next-line no-useless-constructor */

    public constructor(rawsource?: string, text?: string, children: NodeInterface[] = [], attributes: Attributes = {}) {
        super(rawsource, text, children, attributes);
        this.classTypes = [Part];
    }
} // (Part
/* eslint-disable-next-line @typescript-eslint/camelcase,camelcase,@typescript-eslint/class-name-casing */
class field_body extends Element {
    /* eslint-disable-next-line no-useless-constructor */


    public constructor(rawsource?: string, children?: NodeInterface[], attributes?: Attributes) {
        super(rawsource, children, attributes);
        this.classTypes = [Part];
    }
} // (Part

// eslint-disable-next-line @typescript-eslint/class-name-casing
class option extends Element {
    public constructor(rawsource?: string, children?: NodeInterface[], attributes?: Attributes) {
        super(rawsource, children, attributes);
        this.classTypes = [Part];
        this.childTextSeparator = ""; // fixme test this
    }
}

/* eslint-disable-next-line @typescript-eslint/camelcase,camelcase,@typescript-eslint/class-name-casing */
class option_argument extends TextElement {
    public constructor(rawsource?: string, text?: string, children: NodeInterface[] = [], attributes: Attributes = {}) {
        super(rawsource, text, children, attributes);
        this.classTypes = [Part];
    }

    // fixme test this
    public astext(): string {
        const r = super.astext();
        return (this.attributes.delimiter || " ") + r;
    }
}

/* eslint-disable-next-line @typescript-eslint/camelcase,camelcase,@typescript-eslint/class-name-casing */
class option_group extends Element {
    public constructor(rawsource?: string, children?: NodeInterface[], attributes?: Attributes) {
        super(rawsource, children, attributes);
        this.classTypes = [Part];
        this.childTextSeparator = ", ";
    }
}

/* eslint-disable-next-line @typescript-eslint/camelcase,camelcase,@typescript-eslint/class-name-casing */
class option_list extends Element {
    /* eslint-disable-next-line no-useless-constructor */

    public constructor(rawsource?: string, children?: NodeInterface[], attributes?: Attributes) {
        super(rawsource, children, attributes);
        this.classTypes = [Sequential];
    }
} // Sequential
/* eslint-disable-next-line @typescript-eslint/camelcase,camelcase,@typescript-eslint/class-name-casing */
class option_list_item extends Element {
    /* eslint-disable-next-line no-useless-constructor */

    public constructor(rawsource?: string, children?: NodeInterface[], attributes?: Attributes) {
        super(rawsource, children, attributes);
        this.classTypes = [Part];
        this.childTextSeparator = "  ";
    }
}

/* eslint-disable-next-line @typescript-eslint/camelcase,camelcase,@typescript-eslint/class-name-casing */
class option_string extends TextElement {
    /* eslint-disable-next-line no-useless-constructor */

    public constructor(rawsource?: string, text?: string, children: NodeInterface[] = [], attributes: Attributes = {}) {
        super(rawsource, text, children, attributes);
        this.classTypes = [Part];
    }
} // (Part

// eslint-disable-next-line @typescript-eslint/class-name-casing
class description extends Element {
    /* eslint-disable-next-line no-useless-constructor */

    public constructor(rawsource?: string, children?: NodeInterface[], attributes?: Attributes) {
        super(rawsource, children, attributes);
        this.classTypes = [Part];
    }
} // (Part

/* eslint-disable-next-line @typescript-eslint/camelcase,camelcase,@typescript-eslint/class-name-casing */
class literal_block extends FixedTextElement {
    /* eslint-disable-next-line no-useless-constructor */

    // @ts-ignore
    public constructor(...args) {
    // @ts-ignore
        super(...args);
        this.classTypes = [General];
    }
}

/* eslint-disable-next-line @typescript-eslint/camelcase,camelcase,@typescript-eslint/class-name-casing */
class doctest_block extends FixedTextElement {
    /* eslint-disable-next-line no-useless-constructor */

    // @ts-ignore
    public constructor(...args) {
    // @ts-ignore
        super(...args);
        this.classTypes = [General];
    }
}

/* eslint-disable-next-line @typescript-eslint/camelcase,camelcase,@typescript-eslint/class-name-casing */
class math_block extends FixedTextElement {
    /* eslint-disable-next-line no-useless-constructor */

    // @ts-ignore
    public constructor(...args) {
    // @ts-ignore
        super(...args);
        this.classTypes = [General];
    }
}

/* eslint-disable-next-line @typescript-eslint/camelcase,camelcase,@typescript-eslint/class-name-casing */
class line_block extends Element {
    /* eslint-disable-next-line no-useless-constructor */
    public constructor(rawsource?: string, children?: NodeInterface[], attributes?: Attributes) {
        super(rawsource, children, attributes);
        this.classTypes = [General];
    }
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
class line extends TextElement implements HasIndent {
    public indent: number = 0;

    public _init(): void {
        super._init();

        this.classTypes = [Part];
    }
} // Part

/* eslint-disable-next-line @typescript-eslint/camelcase,camelcase,@typescript-eslint/class-name-casing */
class block_quote extends Element {
    /* eslint-disable-next-line no-useless-constructor */

    public constructor(rawsource?: string, children?: NodeInterface[], attributes?: Attributes) {
        super(rawsource, children, attributes);
        this.classTypes = [General];
    }
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
class attribution extends TextElement {
    /* eslint-disable-next-line no-useless-constructor */

    public constructor(rawsource?: string, text?: string, children: NodeInterface[] = [], attributes: Attributes = {}) {
        super(rawsource, text, children, attributes);
        this.classTypes = [Part];
    }
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
class attention extends Element {
    public constructor(rawsource?: string, children?: NodeInterface[], attributes?: Attributes) {
        super(rawsource, children, attributes);
        this.classTypes = [Admonition];
    }
}


// eslint-disable-next-line @typescript-eslint/class-name-casing
class caution extends Element {
    /* eslint-disable-next-line no-useless-constructor */

    public constructor(rawsource?: string, children?: NodeInterface[], attributes?: Attributes) {
        super(rawsource, children, attributes);
        this.classTypes = [Admonition];
    }
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
class danger extends Element {
    /* eslint-disable-next-line no-useless-constructor */

    public constructor(rawsource?: string, children?: NodeInterface[], attributes?: Attributes) {
        super(rawsource, children, attributes);
        this.classTypes = [Admonition];
    }
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
class error extends Element {
    /* eslint-disable-next-line no-useless-constructor */

    public constructor(rawsource?: string, children?: NodeInterface[], attributes?: Attributes) {
        super(rawsource, children, attributes);
        this.classTypes = [Admonition];
    }
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
class important extends Element {
    /* eslint-disable-next-line no-useless-constructor */

    public constructor(rawsource?: string, children?: NodeInterface[], attributes?: Attributes) {
        super(rawsource, children, attributes);
        this.classTypes = [Admonition];
    }
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
class note extends Element {
    /* eslint-disable-next-line no-useless-constructor */

    public constructor(rawsource?: string, children?: NodeInterface[], attributes?: Attributes) {
        super(rawsource, children, attributes);
        this.classTypes = [Admonition];
    }
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
class tip extends Element {
    /* eslint-disable-next-line no-useless-constructor */

    public constructor(rawsource?: string, children?: NodeInterface[], attributes?: Attributes) {
        super(rawsource, children, attributes);
        this.classTypes = [Admonition];
    }
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
class hint extends Element {
    /* eslint-disable-next-line no-useless-constructor */

    public constructor(rawsource?: string, children?: NodeInterface[], attributes?: Attributes) {
        super(rawsource, children, attributes);
        this.classTypes = [Admonition];
    }
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
class warning extends Element {
    /* eslint-disable-next-line no-useless-constructor */
    public constructor(rawsource?: string, children?: NodeInterface[], attributes?: Attributes) {
        super(rawsource, children, attributes);
        this.classTypes = [Admonition];
    }
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
class admonition extends Element {
    /* eslint-disable-next-line no-useless-constructor */

    public constructor(rawsource?: string, children?: NodeInterface[], attributes?: Attributes) {
        super(rawsource, children, attributes);
        this.classTypes = [General, BackLinkable, Labeled, Targetable];
    }
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
class comment extends FixedTextElement {
    /* eslint-disable-next-line no-useless-constructor */

    // @ts-ignore
    public constructor(...args) {
    // @ts-ignore
        super(...args);
        this.classTypes = [Special, Invisible, Inline, Targetable];
    }
}

/* eslint-disable-next-line @typescript-eslint/camelcase,camelcase,@typescript-eslint/class-name-casing */
class substitution_definition extends TextElement {
    /* eslint-disable-next-line no-useless-constructor */

    // @ts-ignore
    public constructor(...args) {
    // @ts-ignore
        super(...args);
        this.classTypes = [Special, Invisible];
    }
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
class target extends TextElement {
    public indirectReferenceName: string = "";

    /* eslint-disable-next-line no-useless-constructor */

    // @ts-ignore
    public constructor(...args) {
    // @ts-ignore
        super(...args);
        this.classTypes = [Special, Invisible, Inline, Targetable];
    }
}

class footnote extends Element {
    public constructor(rawsource?: string, children?: NodeInterface[], attributes?: Attributes) {
        super(rawsource, children, attributes);
        this.classTypes = [General, BackLinkable, Labeled, Targetable];
    }
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
class citation extends Element {
    /* eslint-disable-next-line no-useless-constructor */

    public constructor(rawsource?: string, children?: NodeInterface[], attributes?: Attributes) {
        super(rawsource, children, attributes);
        this.classTypes = [General, BackLinkable, Labeled, Targetable];
    }
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
class label extends TextElement {
    /* eslint-disable-next-line no-useless-constructor */

    public constructor(rawsource?: string, text?: string, children: NodeInterface[] = [], attributes: Attributes = {}) {
        super(rawsource, text, children, attributes);
        this.classTypes = [Part];
    }
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
class figure extends Element {
    /* eslint-disable-next-line no-useless-constructor */

    public constructor(rawsource?: string, children?: NodeInterface[], attributes?: Attributes) {
        super(rawsource, children, attributes);
        this.classTypes = [General];
    }
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
class caption extends TextElement {
    /* eslint-disable-next-line no-useless-constructor */

    public constructor(rawsource?: string, text?: string, children: NodeInterface[] = [], attributes: Attributes = {}) {
        super(rawsource, text, children, attributes);

        this.classTypes = [Part];
    }
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
class legend extends Element {
    /* eslint-disable-next-line no-useless-constructor */

    public constructor(rawsource?: string, children?: NodeInterface[], attributes?: Attributes) {
        super(rawsource, children, attributes);
        this.classTypes = [Part];
    }
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
class table extends Element {
    /* eslint-disable-next-line no-useless-constructor */

    public constructor(rawsource?: string, children?: NodeInterface[], attributes?: Attributes) {
        super(rawsource, children, attributes);
        this.classTypes = [General];
    }
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
class tgroup extends Element {
    public stubs?: {}[];
    /* eslint-disable-next-line no-useless-constructor */

    public constructor(rawsource?: string, children?: NodeInterface[], attributes?: Attributes) {
        super(rawsource, children, attributes);
        this.classTypes = [Part];
    }
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
class colspec extends Element {
    /* eslint-disable-next-line no-useless-constructor */

    public constructor(rawsource?: string, children?: NodeInterface[], attributes?: Attributes) {
        super(rawsource, children, attributes);
        this.classTypes = [Part];
    }
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
class thead extends Element {
    /* eslint-disable-next-line no-useless-constructor */

    public constructor(rawsource?: string, children?: NodeInterface[], attributes?: Attributes) {
        super(rawsource, children, attributes);
        this.classTypes = [Part];
    }
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
class tbody extends Element {
    /* eslint-disable-next-line no-useless-constructor */

    public constructor(rawsource?: string, children?: NodeInterface[], attributes?: Attributes) {
        super(rawsource, children, attributes);
        this.classTypes = [Part];
    }
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
class row extends Element {
    public column?: number;
    /* eslint-disable-next-line no-useless-constructor */

    public constructor(rawsource?: string, children?: NodeInterface[], attributes?: Attributes) {
        super(rawsource, children, attributes);
        this.classTypes = [Part];
    }
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
class entry extends Element {
    /* eslint-disable-next-line no-useless-constructor */

    public constructor(rawsource?: string, children?: NodeInterface[], attributes?: Attributes) {
        super(rawsource, children, attributes);
        this.classTypes = [Part];
    }
}

/* eslint-disable-next-line @typescript-eslint/camelcase,camelcase,@typescript-eslint/class-name-casing */
class system_message extends Element implements Systemmessage {
    public constructor(message: string, children: NodeInterface[], attributes: Attributes) {
        super((attributes.rawsource || ""),
            (message ? [new paragraph("", message), ...children] : children),
            attributes);
        setupBacklinkable(this);
        this.classTypes = [Special, BackLinkable, PreBibliographic];
    }
}

/**
 *  The "pending" element is used to encapsulate a pending operation: the
 *  operation (transform), the point at which to apply it, and any data it
 *  requires.  Only the pending operation's location within the document is
 *  stored in the public document tree (by the "pending" object itself); the
 *  operation and its data are stored in the "pending" object's internal
 *  instance attributes.
 *
 *  For example, say you want a table of contents in your reStructuredText
 *  document.  The easiest way to specify where to put it is from within the
 *  document, with a directive::
 *
 *      .. contents::
 *
 *  But the "contents" directive can't do its work until the entire document
 *  has been parsed and possibly transformed to some extent.  So the directive
 *  code leaves a placeholder behind that will trigger the second phase of its
 *  processing, something like this::
 *
 *      <pending ...public attributes...> + internal attributes
 *
 *  Use `document.note_pending()` so that the
 *  `docutils.transforms.Transformer` stage of processing can run all pending
 *  transforms.
 */
// eslint-disable-next-line @typescript-eslint/class-name-casing
class pending extends Element {
    public details: {};

    public transform: {};

    public constructor(
        transform: {},
        details: {},
        rawsource = "",
        children: NodeInterface[],
        attributes: Attributes
    ) {
        super(rawsource, children, attributes);
        /** The `docutils.transforms.Transform` class implementing the pending
     operation. */
        this.transform = transform;

        /** Detail data (dictionary) required by the pending operation. */
        this.details = details || {};
    }

    // fixme implement this
    /*
  def pformat(self, indent='    ', level=0):
      internals = [
            '.. internal attributes:',
            '     .transform: %s.%s' % (this.transform.__module__,
                                        this.transform.__name__),
            '     .details:']
      details = this.details.items()
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
      obj = this.__class__(this.transform, this.details, this.rawsource,
                            **this.attributes)
      obj.document = this.document
      obj.source = this.source
      obj.line = this.line
      return obj

*/
}


// eslint-disable-next-line @typescript-eslint/class-name-casing
class raw extends FixedTextElement {
    // @ts-ignore
    public constructor(...args) {
    // @ts-ignore
        super(...args);
        this.classTypes = [Special, Inline, PreBibliographic];
    }
}

// =================
//  Inline Elements
// =================
// eslint-disable-next-line @typescript-eslint/class-name-casing
class emphasis extends TextElement {
    /* eslint-disable-next-line no-useless-constructor */

    public constructor(rawsource?: string, text?: string, children: NodeInterface[] = [], attributes: Attributes = {}) {
        super(rawsource, text, children, attributes);
        this.classTypes = [Inline];
    }
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
class strong extends TextElement {
    /* eslint-disable-next-line no-useless-constructor */

    public constructor(rawsource?: string, text?: string, children: NodeInterface[] = [], attributes: Attributes = {}) {
        super(rawsource, text, children, attributes);
        this.classTypes = [Inline];
    }
} // Inline

// eslint-disable-next-line @typescript-eslint/class-name-casing
class literal extends TextElement {
    /* eslint-disable-next-line no-useless-constructor */
    public constructor(rawsource?: string, text?: string, children: NodeInterface[] = [], attributes: Attributes = {}) {
        super(rawsource, text, children, attributes);
        this.classTypes = [Inline];
    }
} // Inline
// eslint-disable-next-line @typescript-eslint/class-name-casing
class reference extends TextElement {
    public indirectReferenceName: string | undefined;
    /* eslint-disable-next-line no-useless-constructor */

    public constructor(rawsource?: string, text?: string, children: NodeInterface[] = [], attributes: Attributes = {}) {
        super(rawsource, text, children, attributes);
        this.classTypes = [General, Inline, Referential];
    }
} // General, Inline, Referential
/* eslint-disable-next-line @typescript-eslint/camelcase,camelcase,@typescript-eslint/class-name-casing */
class footnote_reference extends TextElement {
    /* eslint-disable-next-line no-useless-constructor */

    public constructor(rawsource?: string, text?: string, children: NodeInterface[] = [], attributes: Attributes = {}) {
        super(rawsource, text, children, attributes);
        this.classTypes = [General, Inline, Referential];
    }
} // General, Inline, Referential
/* eslint-disable-next-line @typescript-eslint/camelcase,camelcase,@typescript-eslint/class-name-casing */
class citation_reference extends TextElement {
    /* eslint-disable-next-line no-useless-constructor */

    public constructor(rawsource?: string, text?: string, children: NodeInterface[] = [], attributes: Attributes = {}) {
        super(rawsource, text, children, attributes);
        this.classTypes = [General, Inline, Referential];
    }
} // General, Inline, Referential
/* eslint-disable-next-line @typescript-eslint/camelcase,camelcase,@typescript-eslint/class-name-casing */
class substitution_reference extends TextElement {
    /* eslint-disable-next-line no-useless-constructor */

    public constructor(rawsource?: string, text?: string, children: NodeInterface[] = [], attributes: Attributes = {}) {
        super(rawsource, text, children, attributes);
        this.classTypes = [Inline];
    }
} // General, Inline, Referential
/* eslint-disable-next-line @typescript-eslint/camelcase,camelcase,@typescript-eslint/class-name-casing */
class title_reference extends TextElement {
    /* eslint-disable-next-line no-useless-constructor */

    public constructor(rawsource?: string, text?: string, children: NodeInterface[] = [], attributes: Attributes = {}) {
        super(rawsource, text, children, attributes);
        this.classTypes = [Inline];
    }
} // General, Inline, Referential

/* eslint-disable-next-line @typescript-eslint/camelcase,camelcase,@typescript-eslint/class-name-casing */
class abbreviation extends TextElement {
    /* eslint-disable-next-line no-useless-constructor */

    public constructor(rawsource?: string, text?: string, children: NodeInterface[] = [], attributes: Attributes = {}) {
        super(rawsource, text, children, attributes);
        this.classTypes = [Inline];
    }
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
class acronym extends TextElement {
    /* eslint-disable-next-line no-useless-constructor */

    public constructor(rawsource?: string, text?: string, children: NodeInterface[] = [], attributes: Attributes = {}) {
        super(rawsource, text, children, attributes);
        this.classTypes = [Inline];
    }
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
class superscript extends TextElement {
    /* eslint-disable-next-line no-useless-constructor */

    public constructor(rawsource?: string, text?: string, children: NodeInterface[] = [], attributes: Attributes = {}) {
        super(rawsource, text, children, attributes);
        this.classTypes = [Inline];
    }
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
class subscript extends TextElement {
    /* eslint-disable-next-line no-useless-constructor */

    public constructor(rawsource?: string, text?: string, children: NodeInterface[] = [], attributes: Attributes = {}) {
        super(rawsource, text, children, attributes);
        this.classTypes = [Inline];
    }
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
class math extends TextElement {
    /* eslint-disable-next-line no-useless-constructor */

    public constructor(rawsource?: string, text?: string, children: NodeInterface[] = [], attributes: Attributes = {}) {
        super(rawsource, text, children, attributes);
        this.classTypes = [Inline];
    }
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
class image extends Element {
    /* eslint-disable-next-line no-useless-constructor */

    public constructor(rawsource?: string, children?: NodeInterface[], attributes?: Attributes) {
        super(rawsource, children, attributes);
        this.classTypes = [General, Inline];
    }

    public astext(): string {
        return Array.isArray(this.attributes.alt) ? this.attributes.alt.join(' ') : this.attributes.alt || "";
    }
}


// eslint-disable-next-line @typescript-eslint/class-name-casing
class inline extends TextElement {
    /* eslint-disable-next-line no-useless-constructor */

    public constructor(rawsource?: string, text?: string, children: NodeInterface[] = [], attributes: Attributes = {}) {
        super(rawsource, text, children, attributes);
        this.classTypes = [Inline];
    }
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
class problematic extends TextElement {
    /* eslint-disable-next-line no-useless-constructor */

    public constructor(rawsource?: string, text?: string, children: NodeInterface[] = [], attributes: Attributes = {}) {
        super(rawsource, text, children, attributes);
        this.classTypes = [Inline];
    }
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
class generated extends TextElement {
    /* eslint-disable-next-line no-useless-constructor */

    public constructor(rawsource?: string, text?: string, children: NodeInterface[] = [], attributes: Attributes = {}) {
        super(rawsource, text, children, attributes);
        this.classTypes = [Inline];
    }
}

// ========================================
//  Auxiliary Classes, Functions, and Data
// ========================================
/**
 * convert a node to XML
 */
function nodeToXml(node: NodeInterface): string {
    if (node instanceof Text) {
        const text = xmlescape(node.astext());
        return text;
    }
    if (node.children.length) {
        return [node.starttag(), ...node.children.map((c: NodeInterface): string => nodeToXml(c)), node.endtag()].join("");
    }
    return node.emptytag();
}

export {
    Node, whitespaceNormalizeName, NodeVisitor, GenericNodeVisitor,
    SparseNodeVisitor, nodeToXml, Element, TextElement,
    Text, abbreviation, acronym, address, admonition, attention,
    /* eslint-disable-next-line @typescript-eslint/camelcase,camelcase */
    attribution, author, authors, block_quote, bullet_list, caption,
    /* eslint-disable-next-line @typescript-eslint/camelcase,camelcase */
    caution, citation, citation_reference, classifier, colspec, comment,
    compound, contact, container, copyright, danger, date, decoration,
    /* eslint-disable-next-line @typescript-eslint/camelcase,camelcase */
    definition, definition_list, definition_list_item, description,
    /* eslint-disable-next-line @typescript-eslint/camelcase,camelcase */
    docinfo, doctest_block, document, emphasis, entry, enumerated_list,
    /* eslint-disable-next-line @typescript-eslint/camelcase,camelcase */
    error, field, field_body, field_list, field_name, figure, footer,
    /* eslint-disable-next-line @typescript-eslint/camelcase,camelcase */
    footnote, footnote_reference, generated, header, hint, image,
    /* eslint-disable-next-line @typescript-eslint/camelcase,camelcase */
    important, inline, label, legend, line, line_block, list_item,
    /* eslint-disable-next-line @typescript-eslint/camelcase,camelcase */
    literal, literal_block, math, math_block, note, option,
    /* eslint-disable-next-line @typescript-eslint/camelcase,camelcase */
    option_argument, option_group, option_list, option_list_item,
    /* eslint-disable-next-line @typescript-eslint/camelcase,camelcase */
    option_string, organization, paragraph, pending, problematic, raw,
    reference, revision, row, rubric, section, sidebar, status, strong,
    /* eslint-disable-next-line @typescript-eslint/camelcase,camelcase */
    subscript, substitution_definition, substitution_reference, subtitle,
    /* eslint-disable-next-line @typescript-eslint/camelcase,camelcase */
    superscript, system_message, table, target, tbody, term, tgroup,
    /* eslint-disable-next-line @typescript-eslint/camelcase,camelcase */
    thead, tip, title, title_reference, topic, transition, version,
    warning,

    Root, Titular, PreBibliographic, Bibliographic,
    Decorative, Structural, Body, General, Sequential,
    Admonition, Special, Invisible, Part, Inline, Referential, Targetable, Labeled,
    _addNodeClassNames,

    SkipChildren,
    StopTraversal,
    SkipNode,
    SkipDeparture,
    SkipSiblings,
FixedTextElement,
};
