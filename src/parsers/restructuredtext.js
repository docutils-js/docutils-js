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
    
    async parse(inputstring, document) {
	if(!inputstring) {
	    throw new Error("need input");
	}
	
	this.setupParse(inputstring, document);
	this.stateMachine = new states.RSTStateMachine({
	    stateClasses: this.stateClasses,
	    initialState:this.initialState,
	    debug: document.reporter.debugFlag})
	const inputlines = statemachine.string2lines(
	    inputstring, { tabWidth: document.settings.tabWidth,
			   convertWhitespace: true });
	await this.stateMachine.run(inputlines, document, inliner)
	await this.finishParse()
    }
}

export default {
    Parser,
}

