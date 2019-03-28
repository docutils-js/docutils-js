import { StateMachineWS, StateWS } from '../../StateMachine';
import * as languages from '../../languages'

export class Inliner {
    initCustomizations(settings) {
    }
}

export class RSTStateMachine extends StateMachineWS {
    run({inputLines, document, inputOffset, matchTitles, inliner}) {
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
	this.attachObserver(document.noteSource);
	this.reporter = this.memo.reporter
	this.node = document
	const results = super.run({inputLines, inputOffset, inputSource: document.source});
	if(results.length !== 0) {
	    throw new Error("should be o");
	}
	self.node = self.memo = undefined;
    }
}

class NestedStateMachine extends StateMachineWS {
    run({inputLines, inputOffset, memo, node, matchTitles}) {
	if(matchTitles === undefined) {
	    matchTitles = true;
	}
	this.matchTitles = matchTitles;
	this.memo = memo;
	this.document = memo.document
	this.attachObserver(this.document.noteSource);
	this.reporter = memo.reporter;
	this.language = memo.language;
	this.node = node;
	const results = super.run({inputLines, inputOffset});
	return results;
    }


}

class RSTState extends StateWS {
    constructor(args) {
	super(args);
	/* does it really help to have Body as a string? */
	this.nestedSmKwargs = { stateClasses, initialState: 'Body' };
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

    noMatch(context, transitins) {
	this.reporter.severe(`Internal error: no transition pattern match.  State: "${this.__class__.__name__}"; transitions: ${transitions}; context: ${context}; current line: ${this.stateMachine.line}.`);
	return [ context, null, [] ];
    }

    bof(context) {
	return [[], []]
    }

    nestedParse({ block, inputOffset, node, matchTitles, stateMachineClass, stateMachineKwargs}) {
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
	    stateMachine = new stateMachineClass({debug:this.debug,
					      ...stateMachineKwags});
	}
	stateMachine.run({block, inputOffset, memo: this.memo,
			  node, matchTitles});
	if(useDefault === 2) {
	    this.nestedSmCache.push(stateMachine);
	} else {
	    stateMachine.unlink();
	}
	newOffset = stateMachine.absLineOffset();
	if(block.parent && (len(block) - block_length) !== 0) {
	    this.stateMachine.nextLine(block.length - blockLength);
	}
	return newOffset;
    }

    nestedListParse({block, inputOffset, node, initialState,
		     blankFinish, blankFinishState, extraSettings,
		     matchTitles,
		     stateMachineClass,
		     stateMachineKwargs}) {
	if(!stateMachineClass) {
	    stateMachineClass = this.nestedSm;
	}
	if(!stateMachineKwargs) {
	    state_machine_kwargs = { ... this.stateMachineKwargs };
	}
	stateMachineKwargs.initialState = initialState;
	const stateMachine = new stateMachineClass({debug: this.debug,
						    ... stateMachineKwargs});
	if(!blackFinishState) {
	    blankFinishState = initialState;
	}
	stateMachine.states[blankFinishState].blankFinish = blankFinish;
	Object.keys(extraSettings).forEach(key => {
	    stateMachine.states[initialState][key] = extraSettings[key];
	});
	stateMachine.run({block, inputOffset, memo: this.memo,
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
    initialTransitions = ['bullet']//,  'enumerator', 'field_marker', 'option_marker', 'doctest', 'line_block', 'grid_table_top', 'simple_table_top', 'explicit_markup', 'anonymous', 'line', 'text')
    constructor(args) {
	super({ ...args, initialTransitions: ['bullet'] });
	const pats = { }
	const _enum = { }

	pats['nonalphanum7bit'] = '[!-/:-@[-`{-~]'
	pats['alpha'] = '[a-zA-Z]'
	pats['alphanum'] = '[a-zA-Z0-9]'
	pats['alphanumplus'] = '[a-zA-Z0-9_-]'

	this.pats = pats;
	this.patterns = { 'bullet': '[-+*\u2022\u2023\u2043]( +|$)',
			};
	this.initialTransitions = ['bullet'];
    }

    indent(match, context, nextState) {
	/* match is not match!! */
    }
    
}

export const stateClasses = [Body];
					    
					     
		
    
	
    
