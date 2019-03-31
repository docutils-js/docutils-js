import { StateMachineWS, StateWS } from '../../StateMachine';
import * as languages from '../../languages'
import * as nodes from '../../nodes';
import { InvalidArgumentsError, UnimplementedError as Unimp } from '../../Exceptions'
import { punctuation_chars } from '../../utils';
function isIterable(obj) {
  // checks for null and undefined
  if (obj == null) {
    return false;
  }
  return typeof obj[Symbol.iterator] === 'function';
}

function buildRegexp(definition, compile=true) {
    const di = (isIterable(definition));
    let [ fakeTuple, name, prefix, suffix, parts ] = definition;
    let prefixNames = [];
    if(Array.isArray(prefix)) {
	prefix.shift();
	const pr = prefix.shift();
	prefixNames = [...prefix]
	prefix = pr
    }
    if(suffix === undefined) {
    	throw new Error();
    }
    let suffixNames = [];
    if(Array.isArray(suffix)) {
	suffix.shift();
	const sr = suffix.shift();
	suffixNames = [...suffix]
	suffix = sr
    }
       
    if(!fakeTuple) {
	throw new Error();
    }
    const pi = isIterable(parts);
//    console.log(`buildRegexp(${name} - ${pi})`);
    const partStrings= []
//    console.log(parts);
    if(parts === undefined) {
    	throw new Error();

    }
    const fakeTuple2 = parts.shift();
    const groupNames = []
    for(let part of parts) {
	const fakeTuple3 = Array.isArray(part) ? part[0] : undefined;
	if(fakeTuple3 === 1) {
	    const [regexp, subGroupNames] = buildRegexp(part, null)
	    groupNames.push(...subGroupNames)
	    partStrings.push(regexp);
	}else if(fakeTuple3 === 2) {
	    part.shift();
	    const regexp = part.shift();
	    partStrings.push(regexp);
		groupNames.push(...part)
	    } else{
		partStrings.push(part);
	    }
    }
    const orGroup = partStrings.map(x => `(${x})`).join('|')
    const regexp = `${prefix}(${orGroup})${suffix}`;
//    console.log(new RegExp(regexp))
    groupNames.splice(0, 0, ...prefixNames, name);
    groupNames.push(...suffixNames);
//    console.log('groupnames')
//    console.log(groupNames);
//    console.log(`regexp is ${regexp}`);
    if(compile) {
	return [new RegExp(regexp), groupNames]
    }
    else {
	return [regexp, groupNames];
    }
}
export class Inliner {
    constructor() {
	this.dispatch = {'*': this.emphasis.bind(this),
			 '**': this.strong.bind(this) };
	/*
                    '`': this.interpreted_or_phrase_ref.bind(this)
                    '``': this.literal.bind(this)
                    '_`': this.inline_internal_target.bind(this)
                    ']_': this.footnote_reference.bind(this)
                    '|': this.substitution_reference.bind(this)
                    '_': this.reference.bind(this)
                    '__': this.anonymous_reference.bind(this)}
*/	
	
	this.implicitDispatch = []
	this.non_whitespace_after = ''

	this.nonWhitespaceEscapeBefore = '(?<![\\s\\x00])'
    }

    emphasis(match, lineno) {
        const [ before, inlines, remaining, sysmessages, endstring ] = this.inline_obj( match, lineno, this.patterns.emphasis, nodes.emphasis )
        return [before, inlines, remaining, sysmessages]
   }

strong(match, lineno) {
        const [ before, inlines, remaining, sysmessages, endstring ] = this.inline_obj( match, lineno, this.patterns.strong, nodes.strong )
        return [before, inlines, remaining, sysmessages]
   }

    quoted_start(match) {
	return false; //fixme
    }
    
    inline_obj( match, lineno, end_pattern, nodeclass,
                restore_backslashes=false) {
	if(typeof nodeclass  !== 'function') {
	    throw new Error();
	}
	
	if(!(end_pattern instanceof RegExp)) {
	    throw new Error("")
	}
	
	console.log(match);
        const string = match.match.input
        const matchstart = string.indexOf(match.groups.start);
	if(matchstart == -1) {
	    throw new Error("");
	}
	
        const matchend = matchstart + match.groups.start.length;
	console.log(`${matchstart} ${matchend}`);
        if(this.quoted_start(match)) {
            return [string.substring(0, matchend), [], string.substring(matchend), [], '']
	}
	console.log(end_pattern);
        const endmatch = end_pattern.exec(string.substring(matchend));
	let text, rawsource;
        if(endmatch && endmatch.index) {  // 1 or more chars
            const _text = endmatch.input.substring(0, endmatch.index);
            text = _text;//unescape(_text, restore_backslashes)
	    // this may not work for all situations
            const textend = matchend + endmatch.index + endmatch[0].length;
            rawsource = string.substring(matchstart, textend);////unescape(string[matchstart:textend], True)
            const node = new nodeclass(rawsource, text)
            node.children[0].rawsource = _text;//fixme unescape(_text, true)
            return [string.substr(0, matchstart), [node],
                    string.substr(textend), [], endmatch[1]]
	}
        const msg = this.reporter.warning(
            `Inline ${nodeclass.constructor.name} start-string without end-string.`, { line: lineno});
        text = string.substring(matchstart, matchend);//unescape(string[matchstart:matchend], True)
        rawsource = text;//unescape(string[matchstart:matchend], True)
        const prb = this.problematic(text, rawsource, msg)
        return [string.substring(0, matchstart), [prb], string.substring(matchend), [msg], '']
    }

    initCustomizations(settings) {
	let startStringPrefix, endStringSuffix
	let ssn, esn ;
	if(settings.character_level_inline_markup) {
	    startStringPrefix =  '(^|(?<!\\x00))'
	    ssn = [null, null]
	    endStringSuffix = ''
	    esn = []
	} else {
	    startStringPrefix = ''/*'(^|(?<=\\s|[' + 
                punctuation_chars.openers +
                punctuation_chars.delimiters +
		']))'*/
	    ssn = []
            endStringSuffix = ''/*'($|(?=\\s|[\\x00' + [
                punctuation_chars.closing_delimiters,
                punctuation_chars.delimiters,
                punctuation_chars.closers].join('') +
		']))'*/
	    esn = []
	}
//	this.simplename = '(?:(?!_)\\w)+(?:[-._+:](?:(?!_)\\w)+)*'
	this.simplename = '\\w+'

	const prefix = startStringPrefix;
	const suffix = endStringSuffix;
/*	const initialInline =
	      { prefix, suffix: '',
		parts: {
		    start: {
			prefix: '',
			suffix: this.non_whitespace_after,
			parts: ['\\*\\*','\\*(?!\\*)','``','_`', '\\|(?!\\|)'],
		    },
		    whole: {
			prefix: '',
			suffix,
			parts: 
*/					    
        const parts = [1, 'initial_inline', startStringPrefix, '',
           [0, [1, 'start', '', this.non_whitespace_after, // simple start-strings
             [0, '\\*\\*',                // strong
              '\\*(?!\\*)',            // emphasis but not strong
              '``',                  // literal
              '_`',                  // inline internal target
              [2, '\\|(?!\\|)', null]]            // substitution reference
             ],
            [1, 'whole', '', endStringSuffix, // whole constructs
             [0, // reference name & end-string
              [2, `(${this.simplename})(__?)`, 'refname', 'refend'], 
              [1, 'footnotelabel', '\\[', [2, '(\\]_)', 'fnend'],
               [0, '[0-9]+',               // manually numbered
                [2, `\\#(${this.simplename})?`, null], // auto-numbered (w/ label?)
                '\\*',                   // auto-symbol
                [2, `(${this.simplename})`, 'citationlabel' ]] // citation reference
               ]
              ]
             ],
            [1, 'backquote',             // interpreted text or phrase reference
	     [2, `((:${this.simplename}:)?)`, 'role', null], // optional role
             this.non_whitespace_after,
             [0, [2, '`(?!`)', null]]               // but not literal
             ]
            ]
           ]
	this.startStringPrefix = startStringPrefix;
	this.endStringSuffix = endStringSuffix;
	this.parts = parts;
//	const build = buildRegexp(parts, true);
//	console.log(build[0]);
	this.patterns = {
	    initial: buildRegexp(parts), // KM
	    emphasis: new RegExp(this.nonWhitespaceEscapeBefore +
				 '(\\*)' + endStringSuffix),
	    strong: new RegExp(this.nonWhitespaceEscapeBefore +
			       '(\\*\\*)' + endStringSuffix),
//	    interpreted_or_phrase_ref: new RegExp(`${non_unescaped_whitespace_escape_before}(((:${simplename}:)?(__?)?))${endStringSuffix}`)
	}
    }
    parse(text, { lineno, memo, parent}) {
	this.reporter= memo.reporter;
	this.document = memo.document
	this.language= memo.language
	this.parent = parent
//	console.log(new RegExp(this.patterns.initial[0]));
	const patternSearch = this.patterns.initial[0][Symbol.match].bind(this.patterns.initial[0]);
//	console.log(this.patterns.initial[0]);
	const dispatch = this.dispatch
//	console.log(text.constructor.name);
	let remaining = text;//escape2null(text)
	const processed = []
	let unprocessed = []
	const messages = []
	while(remaining) {
	    const match = this.patterns.initial[0].exec(remaining)
//	    console.log(match);
	    if(match) {
		const rr = {}
		
		this.patterns.initial[1].forEach((x, index) => {
		    rr[x] = match[index];
		});
		const method = this.dispatch[rr.start];
		if(typeof method !== 'function') {
		    throw new Error(`Invalid dispatch ${rr.start}`)
		}
		let before, inlines, sysmessages;
		[ before, inlines, remaining, sysmessages ]  =
		      method({ match, groups: rr}, lineno)
                unprocessed.push(before)
//                messages.add(sysmessages)
                if(inlines) {
                    processed.push(...this.implicit_inline(unprocessed.join(''),
                                                       lineno))
                    processed.push(...inlines)
                    unprocessed = []
		}
	    } else {
		break;
	    }
	}
	if(remaining) {
	    processed.push(...this.implicit_inline(remaining, lineno));
	}
//	console.log(processed);
	return [ processed, messages ]
    }

    implicit_inline(text, lineno) {
	if(!text) {
	    return []
	}
	// FIXME
	return [new nodes.Text(text, text)]
    }
    
}

export class RSTStateMachine extends StateMachineWS {
    run({inputLines, document, inputOffset, matchTitles, inliner}) {
	if(!document) {
	    throw new Error("need document");
	}
	
	if(matchTitles === undefined) {
	    matchTitles = true;
	}
	this.language = languages.getLanguage(document.settings.languageCode)
	this.matchTitles = matchTitles;
	if(inliner === undefined) {
	    inliner = new Inliner();
	}
	inliner.initCustomizations(document.settings);
	this.memo = { document, reporter: document.reporter, language: this.language,
		      titleStyles: [],
		      sectionLevel: 0,
		      sectionBubbleUpKludge: false,
		      inliner };
	this.document = document;
	this.attachObserver(document.noteSource.bind(document));
	this.reporter = this.memo.reporter
	this.node = document
	const results = super.run({inputLines, inputOffset, inputSource: document.source});
	if(results.length !== 0) {
//	    throw new Error("should be o");
	}
	this.node = this.memo = undefined;
    }
}

class NestedStateMachine extends StateMachineWS {
    run({inputLines, inputOffset, memo, node, matchTitles}) {
	if(!inputLines) {
	    throw new Error("need inputlines");
	}
	
	if(matchTitles === undefined) {
	    matchTitles = true;
	}
	this.matchTitles = matchTitles;
	this.memo = memo;
	this.document = memo.document
	if(!this.document) {
	    throw new Error("need document");
	}

	this.attachObserver(this.document.noteSource.bind(this.document));
	this.reporter = memo.reporter;
	this.language = memo.language;
	this.node = node;
	const results = super.run({inputLines, inputOffset});
	return results;
    }
}

class RSTState extends StateWS {
    _init() {
	super._init();
	this.nestedSm = NestedStateMachine;
	this.nestedSmCache = []
	this.stateClasses = stateClasses;
	this.nestedSmKwargs = { stateClasses: this.stateClasses,
				initialState: 'Body' };
    }

    runtimeInit() {
	super.runtimeInit();
	const memo = this.stateMachine.memo;
	this.memo = memo;
	this.reporter = memo.reporter;
	this.inliner = memo.inliner;
	this.document = memo.document;
	this.parent = this.stateMachine.node;
	if(!this.reporter.getSourceAndLine) {
	    this.reporter.getSourceAndLine = this.stateMachine.getSourceAndLine;
	}

    }

    gotoLine(absLineOffset) {
	try {
	    this.stateMachine.gotoLine(absLineOffset);
	} catch(ex) {
	    /* test for eof error? */
	}
    }

    noMatch(context, transitions) {
	this.reporter.severe(`Internal error: no transition pattern match.  State: "${this.constructor.name}"; transitions: ${transitions}; context: ${context}; current line: ${this.stateMachine.line}.`);
	return [ context, null, [] ];
    }

    bof(context) {
	return [[], []]
    }

    nestedParse(block, { inputOffset, node, matchTitles, stateMachineClass, stateMachineKwargs}) {
	if(!this.memo || !this.memo.document) {
	    throw new Error("need memo");
	}
	if(!block) {
	    throw new Error("need block")
	}
	   
	let useDefault = 0;
	if(!stateMachineClass) {
	    stateMachineClass = this.nestedSm;
	    useDefault = useDefault + 1;
	}
	if(!stateMachineKwargs) {
	    stateMachineKwargs = this.nestedSmKwargs;
	    useDefault = useDefault + 1;
	}
	let blockLength = block.length;

	let stateMachine = undefined;
	if(useDefault === 2) {
	    try {
		stateMachine = this.nestedSmCache.pop();
	    } catch(err) {
	    }
	}
	
	if(!stateMachine) {
	    if(!stateMachineKwargs.stateClasses) {
		throw new InvalidArgumentsError("stateClasses")
	    }
//	    if(!stateMachineKwargs.document) {
//		throw new Error("expectinf document")
//	    }
	    stateMachine = new stateMachineClass({debug:this.debug,
						  ...stateMachineKwargs});
	}
	stateMachine.run({inputLines: block, inputOffset, memo: this.memo,
			  node, matchTitles});
	if(useDefault === 2) {
	    this.nestedSmCache.push(stateMachine);
	} else {
	    stateMachine.unlink();
	}
	const newOffset = stateMachine.absLineOffset();
	if(block.parent && (len(block) - block_length) !== 0) {
	    this.stateMachine.nextLine(block.length - blockLength);
	}
	return newOffset;
    }

    nestedListParse(block, {inputOffset, node, initialState,
		     blankFinish, blankFinishState, extraSettings,
		     matchTitles,
		     stateMachineClass,
		     stateMachineKwargs}) {
	if(extraSettings == null) {
		extraSettings = {}
	}
    	if(!stateMachineClass) {
	    stateMachineClass = this.nestedSm;
	}
	if(!stateMachineKwargs) {
	    stateMachineKwargs = { ... this.nestedSmKwargs };
	}
	stateMachineKwargs.initialState = initialState;
	const stateMachine = new stateMachineClass({debug: this.debug,
						    ... stateMachineKwargs});
	if(!blankFinishState) {
	    blankFinishState = initialState;
	}
	if(!(blankFinishState in stateMachine.states)) {
	    throw new InvalidArgumentsError(`invalid state ${blankFinishState}`);
	}
	    
	stateMachine.states[blankFinishState].blankFinish = blankFinish;
	Object.keys(extraSettings).forEach(key => {
	    stateMachine.states[initialState][key] = extraSettings[key];
	});
	stateMachine.run({inputLines: block, inputOffset, memo: this.memo,
			  node, matchTitles});
	blankFinish = stateMachine.states[blankFinishState].blankFinish;
	stateMachine.unlink();
	return [stateMachine.absLineOffset(), blankFinish]
    }

    section({title, source, style, lineno, messages}) {
	if(this.checkSubsection({source, style, lineno})) {
	    this.newSubsection({title, lineno, messages});
	}
    }

    unindentWarning(nodeName) {
	const lineno = this.stateMachine.absLineNumber() + 1;
	return this.reporter.warning(`${nodeName} ends without a blank line; unexpected unindent.`, { line: lineno });
    }

    paragraph(lines, lineno) {
	const data = [lines].flatMap(x => x).join("\n").replace(/\s*$/, '')
	let text;
	let literalnext;
	if(/(?<!\\)(\\\\)*::$/.test(data)) {
	    if(data.length == 2) {
		return [[], 1]
	    }
	    else if(" \n".indexOf(data[length.data - 3]) !== -1) {
		text = data.substring(0, data.length - 3).replace(/\s*$/, '')
	    } else {
		text = data.substring(0, data.length - 1);
	    }
	    literalnext = 1;
	}else {
	    text = data;
	    literalnext = 0;
	}
	const r = this.inline_text(text, lineno)
	const [textnodes, messages] = r
	const p = new nodes.paragraph(data, '', textnodes);
	[ p.source, p.line ] = this.stateMachine.getSourceAndLine(lineno);
	return [[p], literalnext]
    }

    inline_text(text, lineno) {
    	const r = this.inliner.parse(text, { lineno, memo: this.memo, parent: this.parent });
//    	console.log(r);
    	return r;
    }
}

class Body extends RSTState {
    constructor(args) {
	super(args);
	const pats = { }
	const _enum = { }

	pats['nonalphanum7bit'] = '[!-/:-@[-\`{-~]'
	pats['alpha'] = '[a-zA-Z]'
	pats['alphanum'] = '[a-zA-Z0-9]'
	pats['alphanumplus'] = '[a-zA-Z0-9_-]'

	this.pats = pats;
    }

    _init() {
	super._init();
	//	this.doubleWidthPadChar =
	const enum_ = { }
	enum_.formatinfo = {
	    parens: { prefix: '(', suffix: ')', start: 1, end: 1},
	    rparen: { prefix: '', suffix: ')', start: 0, end: -1},
	    period: { prefix: '', suffix: '.', start: 0, end: -1},
	}
	enum_.formats = Object.keys(enum_.formatinfo)
	enum_.sequences = ['arabic', 'loweralpha', 'upperalpha',
			       'lowerroman', 'upperroman']
	enum_.sequencepats = {'arabic': '[0-9]+',
                         'loweralpha': '[a-z]',
                         'upperalpha': '[A-Z]',
                         'lowerroman': '[ivxlcdm]+',
                         'upperroman': '[IVXLCDM]+',}
	enum_.converters = {}// fixme
	enum_.sequenceregexps = {}
	for(let sequence of enum_.sequences){
	    enum_.sequenceregexps[sequence] = new RegExp(enum_.sequencepats[sequence] + '$', 'y')
	}

	this.enum = enum_;
	
	const pats = {}
	pats['nonalphanum7bit'] = '[!-/:-@[-`{-~]'

	this.initialTransitions = [ 'bullet', 'text', 'line']
	
/*          'enumerator',
          'field_marker',
          'option_marker',
          'doctest',
          'line_block',
          'grid_table_top',
          'simple_table_top',
          'explicit_markup',
          'anonymous',
          'line',
            'text'*/

	this.patterns = { 'bullet': '[-+*\u2022\u2023\u2043]( +|$)',
			  'line': `(${pats.nonalphanum7bit})\\1* *$`,
			  'text': '' }
    }

    indent(match, context, nextState) {
	/* match is not match!! */
    }

    bullet(match, context, nextState)
    {
//	console.log(`in bullet`);
	const bulletlist = new nodes.bullet_list();
        [bulletlist.source,
         bulletlist.line] = this.stateMachine.getSourceAndLine()
//	console.log(`${bulletlist.source} ${bulletlist.line}`);
	if(!this.parent) {
	    throw new Error("no parent");
	}
	
	this.parent.add(bulletlist);
        bulletlist['bullet'] = match.result[0].substring(0, 1)

	let [ i, blankFinish ] = this.list_item(match.pattern.lastIndex) /* -1 ? */
	if(!i) {
	    throw new Error("no node");
	}
	
	bulletlist.append(i)
	const offset = this.stateMachine.lineOffset + 1
	let newLineOffset;
	[ newLineOffset, blankFinish ] = this.nestedListParse(this.stateMachine.inputLines.slice(offset), { inputOffset: this.stateMachine.absLineOffset() + 1,
													   node: bulletlist, initialState: 'BulletList',
													   blankFinish });
	this.gotoLine(newLineOffset);
	if(!blankFinish) {
	    //this.parent.append(this.unindentWarning('Bullet list'))
	}
        return [[], nextState, []]
    }

    list_item(indent) {
//	console.log(`in list_item (indent=${indent})`);
	if(indent == null) {
	    throw new Error("Need indent") ;
	}
	
	let indented, line_offset, blank_finish
        if(this.stateMachine.line.length > indent) {
//	    console.log(`get known indentd`);
            [ indented, line_offset, blank_finish ] = 
                this.stateMachine.getKnownIndented({indent})
        } else {
            [ indented, outIndent, line_offset, blank_finish ] = (
                this.stateMachine.getFirstKnownIndented({indent}))
	}
        const listitem = new nodes.list_item(indented.join('\n'))
        if(indented) {
	    console.log('nested parse');
            this.nestedParse(indented, { inputOffset: line_offset,
					 node: listitem })
	}
        return [ listitem, blank_finish ]
    }

    line(match, context, matchState) {
        if(this.stateMachine.matchTitles) {
            return [[match.input], 'Line', []]
        } else if(match.match.input.trim() == '::') {
            throw new statemachine.TransitionCorrection('text')
        } else if(match.match.input.trim().length < 4) {
            const msg = this.reporter.info(
                'Unexpected possible title overline or transition.\n' +
                "Treating it as ordinary text because it's so short.",
                {line: self.state_machine.abs_line_number()})
            this.parent.add(msg)
            throw new statemachine.TransitionCorrection('text')
	} else {
            const blocktext = this.stateMachine.line
            const msg = this.reporter.severe(
                  'Unexpected section title or transition.',
                  nodes.literal_block(blocktext, blocktext),
                { line: self.state_machine.abs_line_number()})
            self.parent.add(msg)
            return [ [], next_state, [] ]
	}
    }
    

    text(match, context, matchState) {
	if(match.input === undefined) {
	    throw new Error("");
	}
	
	return [match.input, 'Text', []]
    }
}

export class Text extends RSTState {
    init() {
	this.patterns = {'underline': Body.patterns['lne'],
			 'text': ''}
	this.initialTransitions = [['underline', 'Body'], ['text', 'Body']];
    }
    
    blank(match, context, nextState) {
	const [ paragraph, literalnext ] = this.paragraph(context, this.stateMachine.absLineNumber() - 1)
	this.parent.append(...paragraph);
	if(literalnext) {
	    this.parent.append(this.literal_Block())
	}
	
	return [[], 'Body',[]]
    }
    eof(context) {
	if(context != null && !isIterable(context) || context.length > 0) {
	    return this.blank(null, context, null);
	}
	return []
    }
	    
    indent(match, context, matchState) {
	throw new Unimp();
    }
    underline(match, context, matchState) {
	throw new Unimp();
    }
    text(match, context, matchState) {
	throw new Unimp();
    }
    literal_block(match, context, matchState) {
	throw new Unimp();
    }
    quoted_literal_block(match, context, matchState) {
	throw new Unimp();
    }
    definition_list_item(match, context, matchState) {
	throw new Unimp();
    }
    term(match, context, matchState) {
	throw new Unimp();
    }
}
export class SpecializedText extends Text {
    _init(){
	super._init();
	this.blank = this.invalidInput;
	this.indent = this.invalidInput;
	this.underline = this.invalidInput;
	this.text = this.invalidInput;
    }
    
    eof() {
	return []
    }
    invalidInput() {
	throw new EOFError();
    }
}

export class Line extends SpecializedText {
    _init() {
	super._init();
	this.eofcheck = 1;
    }

    eof(context) {
	const marker = context[0].trip();
	if(this.memo.sectionBubbleUpKludge) {
	    this.memo.sectionBubbleUpKludge = false;
	} else if(marker.length < 4) {
	    this.stateCorrection(context)
	}
	if(this.eofcheck) {
	    const lineno = self.stateMachine.absLineNumber() - 1
	    const transition = nodes.transition(context[0])
	    transition.line = lineno
	    this.parent.add(lineno)
	}
	this.eofcheck = 1
	return []
    }

    blank(match, context, nextState) {
	throw new Unimp();

    }

    text(match, context, nextState) {
	throw new Unimp();
    }

    underline(match, context, nextState) {
	throw new Unimp();
    }

    shortOverline(context, blocktext, lineno, lines=1) {
	throw new Unimp();
    }

    stateCorrection(context, lines=1) {
	throw new Unimp();
    }
}
    
export class SpecializedBody extends Body{}
export class BulletList extends Body{}

export const stateClasses = [Body, BulletList, Text, Line];
