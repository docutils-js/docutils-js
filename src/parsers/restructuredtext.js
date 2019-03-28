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
	this.stateClasses = states.stateClasses;
	if(!this.stateClasses) {
	    throw new Error("probably need this");
	}
	
	this.inliner = args.inliner;
    }
    
    parse(inputstring, document) {
	console.log(`in parse with ${inputstring}`);
	if(!inputstring) {
	    throw new Error("need input for rst parser");
	}
	
	this.setupParse(inputstring, document);
	this.stateMachine = new states.RSTStateMachine({
	    stateClasses: this.stateClasses,
	    initialState:this.initialState,
	    debug: document.reporter.debugFlag})
	const inputLines = statemachine.string2lines(
	    inputstring, { tabWidth: document.settings.tabWidth,
			   convertWhitespace: true });
	this.stateMachine.run({inputLines, document, inliner: this.inliner})
	this.finishParse()
    }
}

export default {
    Parser,
}

