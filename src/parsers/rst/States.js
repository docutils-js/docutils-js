import { StateMachineWS, StateWS } from '../../StateMachine';
import * as languages from '../../languages'
import * as nodes from '../../nodes';
import { InvalidArgumentsError } from '../../Exceptions'

export class Inliner {
    initCustomizations(settings) {
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
	self.matchTitles = matchTitles;
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
	console.log('calling super.run');
	const results = super.run({inputLines, inputOffset, inputSource: document.source});
	console.log(results);
	if(results.length !== 0) {
	    throw new Error("should be o");
	}
	self.node = self.memo = undefined;
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
	console.log(stateClasses);
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
	    console.log(`setting stateMachineClass to ${this.nestedSm.constructor.name}`);
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
	    console.log(stateMachineKwargs);
	    if(!stateMachineKwargs.stateClasses) {
		throw new InvalidArgumentsError("stateClasses")
	    }
//	    if(!stateMachineKwargs.document) {
//		throw new Error("expectinf document")
//	    }
	    stateMachine = new stateMachineClass({debug:this.debug,
						  ...stateMachineKwargs});
	    console.log(stateMachineClass.name);
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
	    console.log(blankFinishState);
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
	return [stateMachine.absLineOffset(), blank_finish]
    }

    section({title, source, style, lineno, messages}) {
	if(this.checkSubsection({source, style, lineno})) {
	    this.newSubsection({title, lineno, messages});
	}
    }
}

class Body extends RSTState {
    constructor(args) {
	super({ ...args, initialTransitions: ['bullet'] });
	const pats = { }
	const _enum = { }

	pats['nonalphanum7bit'] = '[!-/:-@[-\`{-~]'
	pats['alpha'] = '[a-zA-Z]'
	pats['alphanum'] = '[a-zA-Z0-9]'
	pats['alphanumplus'] = '[a-zA-Z0-9_-]'

	this.pats = pats;
	this.initialTransitions = ['bullet'];
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

	this.initialTransitions = [ 'bullet' ]
	
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
			};
    }

    indent(match, context, nextState) {
	/* match is not match!! */
    }

    bullet(match, context, nextState)
    {
	const bulletlist = new nodes.bullet_list();
        [bulletlist.source,
         bulletlist.line] = this.stateMachine.getSourceAndLine()
	this.parent.add(bulletlist);
        bulletlist['bullet'] = match.result[0].substring(0, 1)

	const [ i, blankFinish ] = this.list_item(match.pattern.lastIndex) /* -1 ? */
	bulletlist.append(i)
	const offset = this.stateMachine.lineOffset + 1
	let newLineOffset;
	[ newLineOffset, blankFinish ] = this.nestedListParse(this.stateMachine.inputLines.slice(offset), { inputOffset: this.stateMachine.absLineOffset() + 1,
													   node: bulletlist, initialState: 'BulletList',
													   blankFinish });
	this.gotoLine(newLineOffset);
	if(!blankFinish) {
	    this.parent.append(this.unindentWarning('Bullet list'))
	}
        return [[], nextState, []]
    }

    list_item(indent) {
	if(indent == null) {
	    throw new Error("Need indent") ;
	}
	
	let indented, line_offset, blank_finish
        if(this.stateMachine.line.length > indent) {
            [ indented, line_offset, blank_finish ] = 
                this.stateMachine.getKnownIndented(indent)
        } else {
            [ indented, outIndent, line_offset, blank_finish ] = (
                this.stateMachine.getFirstKnownIndented(indent))
	}
        const listitem = new nodes.list_item(indented.join('\n'))
        if(indented) {
            this.nestedParse(indented, { inputOffset: line_offset,
					 node: listitem })
	}
        return [ listitem, blank_finish ]
    }
}

export class SpecializedBody extends Body{}
export class BulletList extends Body{}

export const stateClasses = [Body, BulletList];
