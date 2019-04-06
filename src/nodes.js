import Transformer from './Transformer';
import { InvalidArgumentsError} from './Exceptions';
import * as utils from './utils';


function setup_backlinkable(o) {
    o.addBackref = (refid) => o.attributes['backrefs'].push(refid);
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

function isIterable(obj) {
  // checks for null and undefined
  if (obj == null) {
    return false;
  }
  return typeof obj[Symbol.iterator] === 'function';
}

function pseudoQuoteattr(value) {
    return `"${value}"`;
}

function _callDefaultVisit(node) {
    return this.default_visit(node)
}

function _callDefaultDeparture(node) {
    return this.default_departure(node)
}

const nodeClassNames = ['Text', 'abbreviation', 'acronym', 'address', 'admonition', 'attention', 'attribution', 'author', 'authors', 'block_quote', 'bullet_list', 'caption', 'caution', 'citation', 'citation_reference', 'classifier', 'colspec', 'comment', 'compound', 'contact', 'container', 'copyright', 'danger', 'date', 'decoration', 'definition', 'definition_list', 'definition_list_item', 'description', 'docinfo', 'doctest_block', 'document', 'emphasis', 'entry', 'enumerated_list', 'error', 'field', 'field_body', 'field_list', 'field_name', 'figure', 'footer', 'footnote', 'footnote_reference', 'generated', 'header', 'hint', 'image', 'important', 'inline', 'label', 'legend', 'line', 'line_block', 'list_item', 'literal', 'literal_block', 'math', 'math_block', 'note', 'option', 'option_argument', 'option_group', 'option_list', 'option_list_item', 'option_string', 'organization', 'paragraph', 'pending', 'problematic', 'raw', 'reference', 'revision', 'row', 'rubric', 'section', 'sidebar', 'status', 'strong', 'subscript', 'substitution_definition', 'substitution_reference', 'subtitle', 'superscript', 'system_message', 'table', 'target', 'tbody', 'term', 'tgroup', 'thead', 'tip', 'title', 'title_reference', 'topic', 'transition', 'version', 'warning']

const SkipChildren = class {}
const StopTraversal = class {}
const SkipNode = class {}
const SkipDeparture = class {}
const SkipSiblings = class {}

export class NodeVisitor {
    constructor(document) {
	this.document = document;
	this.optional = []
    }

    dispatchVisit(node) {
	const nodeName = node.tagname;
	const methodName = `visit_${nodeName}`;
//	console.log(`visiting ${nodeName}`);
	let method = this[methodName];
	if(!method) {
	    console.log('selecting unknown visit');
	    method = this.unknownVisit;
	}
	this.document.reporter.debug(`docutils.nodes.NodeVisitor.dispatch_visit calling for ${nodeName}`);
        return method.bind(this)(node)
    }

    dispatchDeparture(node) {
	const nodeName = node.tagname;
	const method = this[`depart_${nodeName}`] || this.unknownDeparture;
        this.document.reporter.debug(
            `docutils.nodes.NodeVisitor.dispatch_departure calling for ${node}`);
        return method.bind(this)(node);
    }

    unknownVisit(node) {
	if(this.document.settings.strictVisitor || !(this.optional.includes(node.tagname))) {
	    console.log('throwing error');
	    throw new Error(`visiting unknown node type:${node.tagname}`);
	}
    }
    unknownDeparture(node) {
	if(this.document.settings.strictVisitor || !(this.optional.includes(node.tagname))) {
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
	throw new Error("unimplemented");
    }
    walkabout(visitor) {
	let callDepart = true;
	let stop = false;
	visitor.document.reporter.debug(`docutils.nodes.Node.walkabout calling dispatch_visit for ${this}`);
	try {
	    try {
		visitor.dispatchVisit(this);
	    } catch(error) {
		if (error instanceof SkipNode || error instanceof SkipChildren) {
		    return stop;
		} else if (error instanceof SkipDeparture) {
		    callDepart = false;
		} else {
		    throw error;
		}
	    }
		
	    const children = this.children;
	    try {
		for(let child of [...children]) {
//		    console.log(typeof child);
//		    console.log(Object.keys(child));
		    if(child.walkabout(visitor)) {
			stop = true;
			break;
		    }
		}
	    } catch(error) {
		if(!(error instanceof SkipSiblings)) {
		    throw error;
		}
	    }
	} catch(error) {
	    if(error instanceof StopTraversal) {
		stop = true;
	    } else {
		throw error;
	    }
	}
	if(callDepart) {
            visitor.document.reporter.debug(
                `docutils.nodes.Node.walkabout calling dispatch_departure for ${this}`);
            visitor.dispatchDeparture(this)
	}
	return stop;
    }
}

/* This is designed to be called later, a-nd not with an object. hmm */
export function _addNodeClassNames(names, o) {
    names.forEach(_name => {
	const v = `visit_${_name}`;
	if(!o[v]) {
	    o[v] = _callDefaultVisit.bind(o);
	}
	const d =`depart_${_name}`
	if(!o[d]){
	    o[d] = _callDefaultDeparture.bind(o);
	}
    });
}
export class GenericNodeVisitor extends NodeVisitor {
    constructor(document) {
	super(document);
	_addNodeClassNames(nodeClassNames, this);
    }
    default_visit(node) {
	throw new Error("not implemented");
    }
    default_departure(node) {
	throw new Error("not implemented");
    }
}
GenericNodeVisitor.nodeClassNames = nodeClassNames;


export class Titular { }

export class Element extends Node {
    constructor(rawsource, children, attributes) {
	super();
	this.nodeName = Symbol.for('Element');
	this.children = [];
	if(children === undefined) {
	    children = []
	}
	this.extend(...children);
	this.attributes = { }
	this.listAttributes.forEach(x => {
	    this.attributes[x] = [];
	});
	if(typeof attributes === 'undefined') {
		attributes = {};
	}
	Object.entries(attributes).forEach(([att, value]) => {
	    att = att.toLowerCase();
	    if(att in this.listAttributes) {
		this.attributes[att] = [...value]
	    } else {
		this.attributes[att] = value;
	    }
	});
    }

    toString() {
	if(this.children.length) {
	    return [this.starttag(), ...this.children.map(c => c.toString()), this.endtag()].join('')
	} else {
	    return this.emptytag();
	}
    }

    emptytag() {
        return '<' + [this.tagname, ...Object.entries(this.attlist()).map(([n, v]) => `${n}="${v}"`)].join(' ') + '/>';
    }

    _init() {
	super._init();
	this.childTextSeparator = "\n\n"
	this.basicAttributes = ['ids', 'classes', 'names', 'dupnames']
	this.localAttributes = ['backrefs',]
	this.listAttributes = [...this.basicAttributes, ...this.localAttributes];
    }
    

    astext() {
	return this.children.map(x => x.astext()).join(this.childTextSeparator);
    }

    extend(...items) {
	items.forEach(this.append.bind(this));
    }

    append(item) {
	this.setupChild(item)
	this.children.push(item)
    }

    add(item, ...args) {
	if(args.length !== 0) {
	    throw new Error("");
	}
	if(Array.isArray(item)) {
	    this.extend(...item);
	} else {
	    this.append(item);
	}
    }
    

    setupChild(child) {
	if(!(child instanceof Node)) {
	    throw new InvalidArgumentsError(`Expecting node instance ${child}`)
	}
	
	if(!child) {
	    throw new InvalidArgumentsError();
	}

//	console.log(typeof child);
//	console.log(Object.keys(child))
	child.parent = this;
	if(this.document) {
	    child.document = this.documentl
	    if(child.source === undefined) {
		child.source = this.document.currentSource;
	    }
	    if(child.line === undefined) {
		child.line = this.document.currentLine;
	    }
	}
    }
    
    starttag(quoteattr) {
	if(quoteattr === undefined) {
	    quoteattr = pseudoQuoteattr;
	}
	const parts = [this.tagname];
	const attlist = this.attlist();
	for(let name of Object.keys(attlist)) {
	    const value = attlist[name];
	    if(value === undefined) {
		parts.push(`${name}="True"`);
		continue;
	    }
	    // list
	    // string
	    parts.push(`${name}="${value}"`);
	}
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
	const atts = { }
	for(let key of Object.keys(this.attributes)) {
	    const value = this.attributes[key];
	    if(this.isNotDefault(key)) {
		atts[key] = value
	    }
	}
	return atts;
    }
    isNotDefault(key) {
	if(Array.isArray(this.attributes[key]) && this.attributes[key].length === 0 && this.listAttributes.includes(key)) {
	   return false;
	} else {
	    return true;
	}
    }
}

export class TextElement extends Element {
    constructor(rawsource, text, children, attributes) {
	if(!children) {
	    children = [];
	}
	super(rawsource, (typeof text !== 'undefined' && text !== '') ? [new Text(text), ...children] : children, attributes);
    }
}

export class Text extends Node {
    constructor(data, rawsource='') {
	super();
	if(typeof data === 'undefined') {
		throw new Error("data should not be undefined");
	}

	this.rawsource = rawsource;
	this.data = data;
	this.children = []
    }
    astext() {
	return utils.unescape(this.data);
    }
    toString() {
	return this.astext();
    }
    toSource() {
	return this.toString();
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
	this.substitutionDefs = {}
	this.substitutionNames = {}
	this.refNames = {}
	this.refIds = {}
	this.nameIds = {}
	this.nameTypes = {}
	this.ids = {}
	this.footnoteRefs = {}
	this.citatonRefs = {}
	this.autofootnotes = []
	this.autofootnoteRefs = []
	this.symbolFootnotes = []
	this.symbolFootnooteRefs = []
	this.footNotes = []
	this.citations = []
	this.autofootnoteStart = 1
	this.symbolFootnoteStart = 0
	this.idStart = 1
	this.parseMesssages = []
	this.transformMessages = []
	this.transformer = new Transformer(this);
	this.decoration = undefined;
	this.document = this;
    }

    setId(node, msgNode) {
	let msg;
	let id;
	for(id of node.attributes.ids) {
	    if(id in this.ids && this.ids[id] !== node) {
		msg = self.reporter.severe(`Duplicate ID: "${id}".`);
		if(msgnode) {
		    msgnode.add(msg);
		}
	    }
	}
	if(node.attributes.ids.length === 0){
	    let name;
	    let myBreak = false;
	    for(name of node.attributes.names) {
		id = this.settings.idPrefix + makeId(name);
		if(id && !(id in this.attributes.ids)){
		    myBreak = true;
		    break;
		}
	    }
	    if(!myBreak) {
		id = ''
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
    }

    setDuplicateNameId(node, id, name, msgnode, explicit) {
    }

    hasName(name) {
	return Object.keys(self.nameIds).includes(name);
    }
    
    noteImplicitTarget(target, msgnode) {
	const id = this.setId(target, msgnode);
	this.setNameIdMap(target, id, msgnode);
    }

    noteRefName(node) {
	this.refNames.setDefault(node.refname, []).push(node);
    }

    noteRefId(node) {
	this.refIds.setDefault(node.refid, []).push(node);
    }

    noteIndirectTarget(target) {
	this.indirectTargets.push(target);
	if(target.names) {
	    this.noteRefname(target);
	}
    }

    noteAnonymousTarget(tartget) {
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
	this.footnoteRefs.setDefault(ref.refname, []).append(ref);
	this.noteRefName(ref);
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
	let name = whitespaceNormalizeName(defName);
	if(Object.keys(this.substitutionDefs).includes(name)) {
	    let msg = this.reporter.error(`Duplicate substitution definition name: "${name}".`, { baseNode: subdef });
	    if(msgnode != None) {
		msgnode.add(msg);
	    }
	    let oldnode = this.substitutionDefs[name];
	    dupName(oldnode, name);
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
	if(offset === undefined) {
	    this.currentLine = offset;
	}else {
	    this.currentLine = offset + 1;
	}
    }

    copy() {
	// copy
    }

    getDecoration() {
	if(!this.decoration) {
	    this.decoration = new decoration();
	    let index = this.firstChildNotMatchingClass(Titular);
	    if(index === undefined) {
		this.push(this.decoration);
	    }else {
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

export class section extends Element { } // Structural
export class title extends TextElement { } // Titular, Prebib

export class paragraph extends TextElement  { } // General
/*class compound(General, Element): pass
class container(General, Element): pass
class bullet_list(Sequential, Element): pass
class enumerated_list(Sequential, Element): pass
class list_item(Part, Element): pass*/
export class definition_list extends Element {}
export class definition_list_item extends Element {}
export class term extends TextElement {}
export class definition extends Element {}
/*
class classifier(Part, TextElement): pass
*/
export class field_list extends Element { } // (Sequential, Element
export class field extends Element {} // (Part
export class field_name extends TextElement {} // (Part
export class field_body extends Element { } // (Part


export class bullet_list extends Element { } // Sequential
export class list_item extends Element { }

/* Inline elements */
export class emphasis extends TextElement {} // Inline
export class strong extends TextElement {} // Inline
export class literal extends TextElement {} // Inline

export class problematic extends TextElement {} // Inline

export class transition extends Element {} // Structura

export class option_group extends Element {
    //child_text_separator = ', '
}

export class option_list extends Element { } //Sequential
export class option_list_item extends Element { } //    child_text_separator = '
export class option_string extends TextElement { } // (Part
export class description extends Element { } //(Part
export class literal_block extends FixedTextElement {}
export class doctest_block extends FixedTextElement {}
export class math_block extends FixedTextElement {}
export class line_block extends Element { }

export class block_quote extends Element{ }
export class attribution extends TextElement{ }
export class attention extends Element{ }
export class caution extends Element{ }
export class danger extends Element{ }
export class error extends Element{ }
export class important extends Element{ }
export class note extends Element{ }
export class tip extends Element{ }
export class hint extends Element{ }
export class warning extends Element{ }
export class admonition extends Element{ }
export class comment extends FixedTextElement{ }
export class substitution_definition extends TextElement{ }
export class target extends TextElement{ }
export class footnote extends Element { }
export class citation extends Element{ }
export class label extends  TextElement{ }
export class figure extends Element{ }
export class caption extends TextElement{ }
export class legend extends Element{ }
export class table extends Element{ }
export class tgroup extends Element{ }
export class colspec extends Element{ }
export class thead extends  Element{ }
export class tbody extends  Element{ }
export class row extends  Element{ }
export class entry extends Element{ }


export class system_message extends Element {
    constructor(message, children, attributes) {
	super(attributes.rawsource || '', message ? [new paragraph('', message), ...children] : children, attributes);
	setup_backlinkable(this);
    }
}

export default {
    document,
}
