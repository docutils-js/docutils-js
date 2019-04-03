import BaseParser from '../Parser';
import * as states from './rst/States';
import * as statemachine from '../StateMachine';

export class Parser extends BaseParser {
    constructor(args) {
	super(args);
	this.configSection = 'restructuredtext parser';
	this.configSectionDependencies = ['parsers'];
	if(args.rfc2822) {
	    this.initialState = 'RFC2822Body';
	} else {
	    this.initialState = 'Body';
	}
//	console.log(`setting initial state to ${this.initialState}`);
	this.stateClasses = states.stateClasses;
	if(!this.stateClasses) {
	    throw new Error("probably need this");
	}
//	console.log('state classes');
//	console.log(this.stateClasses);
	
	this.inliner = args.inliner;
    }
    
    parse(inputstring, document) {
	if(!inputstring) {
	    throw new Error("need input for rst parser");
	}
	
	this.setupParse(inputstring, document);
	if(!this.stateClasses) {
	    throw new Error("need classes")
	}

	this.stateMachine = new states.RSTStateMachine({
	    stateClasses: this.stateClasses,
	    initialState: this.initialState,
	    debugFn: this.debugFn,
	    debug: document.reporter.debugFlag})
	const inputLines = statemachine.string2lines(
	    inputstring, { tabWidth: document.settings.tabWidth,
			   convertWhitespace: true });
//	console.log(`initial state is ${this.initialState}`);
	this.stateMachine.run({inputLines, document, inliner: this.inliner})
	this.finishParse()
    }
}

export default {
    Parser,
}

