import Transformer from './Transformer';

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
	console.log(`visiting ${nodeName}`);
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
	this.parent = undefined;
	this.document = undefined;
	this.source = undefined;
	this.line = undefined;
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
		if(error instanceof SkipNode || error instanceof SkipChildren) {
		    return stop;
		} else if(error instanceof SkipDeparture) {
		    callDepart = false;
		} else {
		    throw error;
		}
		
		const children = this.children;
		try {
		    for(let child of [...children]) {
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
	    }

	} catch(error) {
	    if(error instanceof SkipChildren) {
	    } else if(error instanceof StopTraversal) {
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

function _addNodeClassNames(names, o) {
    names.forEach(_name => {
	o[`visit_${_name}`] = _callDefaultVisit.bind(o);
	o[`depart_${_name}`] = _callDefaultDeparture.bind(o);
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


export class Titular { }

export class Element extends Node {
    constructor(rawsource, children, attributes) {
	super();
	this.nodeName = Symbol.for('Element');
	this.children = [];
	if(children === undefined) {
	    children = []
	}
	this.extend(children);
	this.attributes = { }
    }

    extend(item) {
	item.forEach(this.append.bind(this));
    }

    append(item) {
	this.setupChild(item)
	this.children.push(item)
    }

    add(item) {
	this.append(item);
    }
    

    setupChild(child) {
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
	    parts.push(`${name}=${value}`);
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
	node.ids.forEach(id => {
	    if(this.ids[id] !== node) {
		msg = self.reporter.severe(`Duplicate ID: "${id}".`);
		if(msgnode) {
		    msgnode.add(msg);
		}
	    }
	});
	if(!node.ids){
	    node.names.foreach(name => {
		let id = this.settings.idPrefix + makeId(name);
		if(id && !self.ids[id]){
		}
	    });
	}
	// fixme bla
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
	this.setNameIdMap(target, id, msgnode, explicit);
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

    gtDecoration() {
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

export class bullet_list extends Element { // Sequential
}

export default {
    document,
}
