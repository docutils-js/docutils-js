import UnknownStateError from './UnknownStateError';
import ErrorOutput from './ErrorOutput';
import { EOFError, InvalidArgumentsError, UnimplementedError as Unimp } from './Exceptions'

export class TransitionCorrection extends Error {
}
export class StateCorrection extends Error {
}

function isIterable(obj) {
  // checks for null and undefined
  if (obj == null) {
    return false;
  }
  return typeof obj[Symbol.iterator] === 'function';
}

function __getClass(object) {
  return Object.prototype.toString.call(object)
    .match(/^\[object\s(.*)\]$/)[1];
};

export class StateMachine {
    /* 
        Initialize a `StateMachine` object; add state objects.

       Parameters:

        - `state_classes`: a list of `State` (sub)classes.
        - `initial_state`: a string, the class name of the initial state.
        - `debug`: a boolean; produce verbose output if true (nonzero).
	*/

    constructor({ stateClasses, initialState, debug }) {
	if(stateClasses == null || stateClasses.length == 0) {
	    throw new InvalidArgumentsError("stateClasses");
	}
	this._init();
	debug = true;
	this.inputLines = undefined;
	this.inputOffset = 0;
	this.line = undefined;
	this.lineOffset = -1;
	this.debug = debug;
	this.initialState = initialState;
	this.currentState = initialState;
	this.states = {};
	this.addStates(stateClasses);
	this.observers = []
	this._stderr = new ErrorOutput();
    }

    _init() {
    }
    
    unlink() {
	Object.values(this.states).forEach(s => s.unlink());
	this.states = undefined;
    }

    run({ inputLines, inputOffset, context, inputSource, initialState}) {
	/*
        Run the state machine on `input_lines`. Return results (a list).

        Reset `self.line_offset` and `self.current_state`. Run the
        beginning-of-file transition. Input one line at a time and check for a
        matching transition. If a match is found, call the transition method
        and possibly change the state. Store the context returned by the
        transition method to be passed on to the next transition matched.
        Accumulate the results returned by the transition methods in a list.
        Run the end-of-file transition. Finally, return the accumulated
        results.

        Parameters:

        - `input_lines`: a list of strings without newlines, or `StringList`.
        - `input_offset`: the line offset of `input_lines` from the beginning
          of the file.
        - `context`: application-specific storage.
        - `input_source`: name or path of source of `input_lines`.
        - `initial_state`: name of initial state.
	*/
	this.runtimeInit();
	//if isinstance(input_lines, StringList):
	//self.input_lines = input_lines
//	if(Array.isArray(inputLines)) {
//	    console.log('inputLines is an array');
//	}
	    
	//else:
	if(inputLines instanceof StringList) {
//	    this.inputLines = inputLines.data;
	    this.inputLines = inputLines;
//	    console.log(inputLines);
	} else if (inputLines == null ) {
	    throw new InvalidArgumentsError("inputLines should not be null or undefined");
	} else {
	    //	    this.inputLines = inputLines;
	    if(!isIterable(inputLines)) {
		inputLines = [inputLines]
	    }
	    this.inputLines = new StringList(inputLines, inputSource);
//	    console.log(this.inputLines);
	}
	this.lineOffset = -1;
	
	this.currentState = initialState || this.initialState;
	if(!this.currentState) {
	    console.log('No current state');
	}
	let transitions = undefined;
	const results = [];
	let state = this.getState();
	let nextState;
	let result
	try {
	    [ context, result ] = state.bof(context);
	    results.push(result);
	    while(true) {
		try {
		    try {
			this.nextLine();
			const r = this.checkLine(context, state, transitions);
			[ context, nextState, result ] = r;
			if(!isIterable(result)) {
			    throw new Error("Expect iterable result, got: " + result);
			}
			results.push(...result);
		    }
		    catch(error) {
			if(error instanceof EOFError) {
			    result = state.eof(context);
			    results.push(...result);
			    break;
			} else {
			    throw error;
			}
		    }
		}
		catch(error) {
		    if(error instanceof TransitionCorrection) {
			this.previousLine();
			transitions = [error.args[0]]
			/* if self.debug:
                        print >>self._stderr, (
                              '\nStateMachine.run: TransitionCorrection to '
                              'state "%s", transition %s.'
                              % (state.__class__.__name__, transitions[0]))*/
			continue;
		    } else if(error instanceof StateCorrection) {
			this.previousLine();
			nextState = error.args[0]
			if(error.args.length === 1) {
			    transitions = null;
			} else {
			    transitions = [error.args[1]]
			}
		    /*                    if self.debug:
                        print >>self._stderr, (
                              '\nStateMachine.run: StateCorrection to state '
                              '"%s", transition %s.'
                              % (next_state, transitions[0]))
		    */
		    } else {
			throw error;
		    }
		}
		state=this.getState(nextState)
	    }
	}
	catch(error) {
	    throw error;
	}
	this.observers = [];
	return results;
    }

    /**
      *         Return current state object; set it first if
      *         `next_state` given.  Parameter `next_state`: a string,
      *         the name of the next state.  Exception:
      *         `UnknownStateError` raised if `next_state` unknown.
      */
    getState(nextState) {
	if(nextState) {
	    if(this.debug && nextState !== this.currentState) {
		console.log(`StateMachine.getState: changing state from "${this.currentState}" to "${nextState}" (input line ${this.absLineNumber()})`);
	    }
	    this.currentState = nextState;
	}
	if(!this.states.hasOwnProperty(this.currentState)) {
	    throw new UnknownStateError(this.currentState);
	}
	return this.states[this.currentState];
    }

    /* Load `self.line` with the `n`'th next line and return it.*/
    nextLine(n=1) {
///	console.log('*** advancing to next line');
	this.lineOffset += n;
	if(this.lineOffset >= this.inputLines.length) {
	    this.line = null;
	    this.notifyObservers()
	    throw new EOFError();
	}
	
	this.line = this.inputLines[this.lineOffset];
	this.notifyObservers()
//	console.log(`line is "${this.line}"`);
	return this.line;
    }

    isNextLineBlank() {
	return !(this.inputLines[this.lineOffset + 1].trim());
    }
    
    atEof() {
	return this.lineOffset >= this.inputLines.length - 1
    }

    atBof() {
	return this.lineOffset <= 0
    }

    previousLine(n=1) {
	this.lineOffset -= n;
	if(this.lineOffset < 0) {
	    this.line = null;
	}else {
	    this.line = this.inputLines[this.lineOffset]
	}
	this.notifyObservers()
	return this.line;
    }

    gotoLine(lineOffset) {
	this.lineOffset = lineOffset - this.inputOffset;
	this.line = this.inputLines[this.lineOffset]
	this.notifyObservers()
	return this.line
    }

    getSource(lineOffset) {
	return this.inputLines.source(lineOffset - this.inputOffset);
    }

    absLineOffset() {
	return this.lineOffset + this.inputOffset;
    }

    absLineNumber() {
	return this.lineOffset + this.inputOffset + 1
    }

    getSourceAndLine(lineno) {
	let offset, srcoffset, srcline, src;
	if(lineno === undefined) {
	    offset = this.lineOffet;
	}  else {
	    offset = lineno - this.inputOffset - 1;
	}
	try {
	    [ src, srcoffset ] = this.inputLines.info(offset)
	    srcline = srcoffset +  1;
	} catch(error) {
	    // ??
	}
	return [ src, srcline ]
    }

    atEof() {
	return this.lineOffset >= this.inputLines.length - 1
    }

    atBof() {
	return this.lineOffset <= 0
    }

    previousLine(n=1) {
	this.lineOffset -= n;
	if(this.lineOffset < 0) {
	    this.line = null;
	}else {
	    this.line = this.inputLines[this.lineOffset]
	}
	this.notifyObservers()
	return this.line;
    }

    gotoLine(lineOffset) {
	this.lineOffset = lineOffset - this.inputOffset;
	this.line = this.inputLines[this.lineOffset]
	this.notifyObservers()
	return this.line
    }

    getSource(lineOffset) {
	return this.inputLines.source(lineOffset - this.inputOffset);
    }

    absLineOffset() {
	return this.lineOffset + this.inputOffset;
    }

    absLineNumber() {
	return this.lineOffset + this.inputOffset + 1
    }

    getSourceAndLine(lineno) {
	let offset, srcoffset, srcline, src;
	if(lineno === undefined) {
	    offset = this.lineOffet;
	}  else {
	    offset = lineno - this.inputOffset - 1;
	}
	try {
	    [ src, srcoffset ] = this.inputLines.info(offset)
	    srcline = srcoffset +  1;
	} catch(error) {
	    // ??
	}
	return [ src, srcline ]
    }

    insertInput(inputLines, source) {
	throw new Unimp();
    }

    getTextBlock() {
	throw new Unimp();
    }
    checkLine(context, state, transitions) {
//	console.log(`checking line ${this.line}`);
	if(transitions === undefined) {
	    transitions = state.transitionOrder;
	}
	let stateCorrection = true;
//	if(transitions.length === 0) {
//	    throw new Error("no transitions");
//	}
			   
	for(let name of transitions) {
	    const [ pattern, method, nextState ] = state.transitions[name];
	    //	    console.log(method);
//	    console.log(`checkLine: ${name} ${pattern} ${nextState}`);
	    const result = pattern.exec(this.line);
	    if(result) {
//		console.log(`pattern match for ${name}`);
		const r = method({ pattern, result, input: this.line }, context, nextState);
//		console.log(`return is >>> `);
//		console.log(r);
		return r;
	    }
	}
	return state.noMatch(context, transitions);
    }

    addState(stateClass) {
	const stateName = stateClass.name;
//	console.log(`adding state ${stateName}`);

	if(this.states.hasOwnProperty(stateName)) {
	    throw new DuplicateStateError(stateName);
	}
	const r = new stateClass({ stateMachine: this, debug: this.debug });
	this.states[stateName] = r;
    }

    addStates(stateClasses) {
	if(!stateClasses) {
	    throw new Error("");
	}
	stateClasses.forEach(this.addState.bind(this));
    }

    runtimeInit() {
	Object.values(this.states).forEach(s => s.runtimeInit());
    }


    error() {
    }

    attachObserver(observer) {
	this.observers.push(observer);
    }

    detachObserver(observer) {
	this.observers.remove(observer);
    }

    notifyObservers() {
	for(let observer of this.observers) {
	    let info = [];
	    try {
		 info = this.inputLines.info(this.lineOffset);
	    } catch(err) {
	    }
	    observer(...info);
	}
    }
}

export class State {
    constructor(args) {
	const { stateMachine,debug } = args;
	    this._init();
	    this.transitionOrder = []
	this.transitions = {}
	//this.patterns = {}
	//this.initialTransitions = args.initialTransitions;
	//this.wsInitialTransitions = args.wsInitialTransitions;

	this.addInitialTransitions()
	if(!stateMachine) {
	    throw new Error("Need statemachine");
	}
	
	this.stateMachine = stateMachine;
	this.debug = debug;
	if(!this.nestedSm){
	    this.nestedSm = this.stateMachine.constructor;
	}
	if(!this.nestedSmKwargs) {
	    this.nestedSmKwargs = { stateClasses: [this.constructor],
				    initialState: this.constructor.name };
	}
    }

    _init() {
	    /* empty */
	this.patterns = {}
	this.initialTransitions = null
	this.nestedSm = null
    }

    runtimeInit() {
	/* empty */
    }

    unlink() {
	this.stateMachine = undefined;
    }

    addInitialTransitions() {
	if(this.initialTransitions) {
	    const [ names, transitions ] = this.makeTransitions(this.initialTransitions);
	    this.addTransitions(names, transitions);
	}
    }

    addTransitions(names, transitions) {
	names.forEach((name => {
	    if(name in this.transitions) {
		throw new DuplicateTransitionError(name);
	    }
	    if(!(name in transitions)) {
		throw new UnknownTrransitionError(name);
	    }
	}).bind(this));
	this.transitionOrder.push(...names);
	Object.keys(transitions).forEach( key => {
	    this.transitions[key] = transitions[key];
	});
    }

    addTransition(name, transition) {
    }

    removeTransition(name) {
    }

    makeTransition(name, nextState) {
	if(name == null) {
	    throw new InvalidArgumentsError('need transition name');
	}
	if(nextState === undefined) {
	    nextState = this.constructor.name;
	}

	let pattern = this.patterns[name];
	if(!(pattern instanceof RegExp)) {
	    pattern = new RegExp('^' + pattern, 'y');
	}
	if(typeof(this[name]) !== 'function') {
	    throw new Error(`cant find method ${name} on ${this.constructor.name}`);
	}
	
	const method = this[name].bind(this);
	
	return [pattern, method, nextState];
    }

    makeTransitions(nameList) {
	const names = [];
	const transitions = {};
	if(!Array.isArray(nameList)) {
	    console.log('warning, not an array');
	    throw new Error('not array');
	}
	
	for(let namestate of nameList) {
	    if(namestate == null) {
		throw new InvalidArgumentsError("nameList contains null");
	    }
	    if(!Array.isArray(namestate)) {
		transitions[namestate] = this.makeTransition(namestate)
		names.push(namestate);
	    } else {
		transitions[namestate[0]] = this.makeTransition(...namestate);
	    }
	}
	return [names, transitions]
    }

    noMatch(context, transitions) {
    }

    bof(context) {

    }
    eof(context) {
	return [];
    }
    nop(match, context, nextState) {
	return [ context, nextState, [] ];
    }
    
}

export class StateMachineWS extends StateMachine {
    getIndented({untilBlank, stripIndent}) {
	if(stripIndent === undefined) {
	    stripIndent = true;
	}
	let offset = this.absLineOffset();
	let [ indented, indent, blankFinish ] = this.inputLines.getIndented({ lineOffset: this.lineOffset, untilBlan, stripIndent});
	if(indented) {
	    this.nextLine(indented.length - 1);
	}
	while(indented && !(indented[0].trim())) {
	    indented.ltrim();
	    offset = offset + 1;
	}
	return [ indented, indent, offset, blankFinish ];
    }

    getKnownIndented({indent, untilBlank, stripIndent}) {
	let indented, blankFinish;
	if(stripIndent === undefined) {
	    stripIndent = true;
	}
	let offset = this.absLineOffset();
	[ indented, indent, blankFinish ] = this.inputLines.getIndented( { lineOffset: this.lineOffset, untilBlank, stripIndent, blockIndent: indent })
	this.nextLine(indented.length - 1);
	while(indented.length && !(indented[0].trim())) {
	    indented.trimStart();
	    offset = offset + 1;
	}
	return [ indented, offset, blankFinish ];
    }

    getFirstKnownIndented({indent, untilBlank, stripIndent, stripTo}) {
	let indented, blankFinish;
	if(stripIndent === undefined) {
	    stripIndent = true;
	}
	if(stripTop === undefined) {
	    stripTop = true;
	}
	let offset = this.absLineOffset();
	[ indented, indent, blankFinish ] = this.inputLines.getIndented({
	    lineOffset: this.lineOffset, untilBlank, stripIndent,
	    firstIndent: indent });
	this.nextLine(indented.length - 1);
	if(stripTop) {
	    while(indented.length && !(indented[0].strip())) {
		indented.tripStart();
		offset = offset + 1;
	    }
	}
	return [indented, indent, offset, blankFinish ];
    }
}

export class StateWS extends State {
    constructor(args) {
	super({ ...args})
	if(!this.indentSm) {
	    this.indentSm = this.nestedSm;
	}
	if(!this.indentSmKwargs) {
	    this.indentSmKwargs = this.nestedSmKwargs;
	}
	if(!this.knownIndentSm) {
	    this.knownIndentSm = this.indentSm;
	}
	if(!this.knownIndentSmKwargs) {
	    this.knownIndentSmKwargs = this.indentSmKwargs;
	}
    }
    _init() {
	super._init()
	this.indentSm = null
	this.indentSmKwargs = null
	this.knownIndentSm = null
	this.knownIndentSmKwargs = null
	this.wsPatterns = {blank: ' *$',
			   indent:' +'}
	this.wsInitialTransitions = ['blank', 'indent']
    }
    
    addInitialTransitions() {
	super.addInitialTransitions();
	if(!this.patterns) {
	    this.patterns = {}
	}
	this.patterns = { ...this.patterns, ... this.wsPatterns };
	const [ names, transitions ] = this.makeTransitions(this.wsInitialTransitions);
	this.addTransitions(names, transitions);
    }

    blank(match, context, nextState) {
	return this.nop(match, context, nextState);
    }

    indent(match, context, nextState) {
	const [ indented, indent, lineOffset, BlankFinish ] = this.stateMachine.getIndented();
	const indentSm = this.indentSm;
	const sm = new indentSm({ debug: this.debug, ...this.indentSmKwargs});
	const results = sm.run({ indented, inputOffset: lineOffset});
	return [ context, nextState, results ];
    }

    knownIndent(match, context, nextState) {
	const [ indetned, ineOffset, blankFinish ] = this.stateMachine.getKnownIndented(match.end()) // fail
	const knownIndentSm = this.knownIdentSm;
	const sm = new knownIndentSm({ debug:this.debug,
				       ...this.knownIndentSmKwargs});
	const results = sm.run({indented, inputOffset: lineOffset});
	return [ context, nextState, results ];
    }

    firstKnownIndent(match, context, nextState) {
	const [ indented, lineOffset, blankFinish] = this.stateMachine.getFirstKnownIndented(match.end());
	const knownIndentSm = this.knownIndentSm;
	const sm = new knownIndentSm({debug: this.debug, ...this.knownIndentSmKwargs});
	const results = sm.run({indented, inputOffset: lineOffset});
	return [ context, nextState, results ];
    }
}

export function string2lines(astring, args) {
    if(!astring) {
	astring = "";
    }
    
    let { tabWidth, convertWhitespace, whitespace } = args;
    if(whitespace === undefined) {
    }
    if(tabWidth === undefined) {
	tabWidth = 8;
    }
    /* fo a bunch of stuff */
    return astring.split('\n').map(x => x);
}

export class ViewList extends Array {
    constructor(initlist, source, items, parent, parentOffset) {
	super(...initlist)
	this.items = []
	this.parent = parent
	this.parentOffset = parentOffset;

	if(initlist instanceof ViewList) {
//	    this.data = [...initlist.data]
	    this.items = [...initlist.items]
	} else if(initlist) {
//	    this.data = [...initlist]
	    if(items) {
		this.items = items
	    } else {
		this.items = []
		for (let i = 0; i < initlist.length; i++) {
		    this.items.push([source, i])
		}
	    }
	}
    }

    slice(start, end) {
	const initList = [];
	if(end == null) {
	    end = this.length;
	}
	for(let i = start; i < end; i++) {
	    initList.push(this[i]);
	}
	return new this.constructor(initList);
    }
}

export class StringList extends ViewList {
    trimLeft(length, start, end) {
	for(let i = start; i < end; i++) {
	    this.data[i] = this.data[i].substring(length);
	}
    }
    getTextBlock(start, flushLeft) {
	throw new UnimplementedException("getTextBlock");
    }
    getIndented({start, untilBlank, stripIndent, blockIndent, firstIndent}) {
    	if(start == null) {
    		start = 0;
	}
	let indent = blockIndent;
	let end = start;
	if(blockIndent != null && firstIndent == null) {
	    firstIndent = blockIndent;
	}
	if(firstIndent != null) {
	    end = end + 1;
	}
	let last = this.length;
	let blankFinish;
	while(end < last) {
	    const line = this[end];
	    if(line && (line[0] != ' '  || (blockIndent != null))) { // FIXME
		blankFinish = ((end > start) && !this[end - 1].trim());
		break;
	    }
	    const stripped = line.replace(/^\s*/, '');
	    if(!stripped) {
		if(untilBlank) {
		    blankFinish = 1;
		    break;
		}
	    } else if(blockIndent == null) {
		const lineIndent = line.length - stripped.length;
		if(indent == null) {
		    indent = lineIndent;
		} else {
		    indent = min(indent, lineIndent);
		}
	    }
	    end = end + 1;
	}
	if(end === last) {
	    blankFinish = 1;
	}
	
	const block = this.slice(start, end);
	if(firstIndent != null && block) {
	    block[0] = block[0].substring(firstIndent);
	}
	if(indent && stripIndent) {
//	    console.log(block.constructor.name);
	    block.trimLeft(indent, firstIndent != null);
	}
	
	return block.length ? [ block, indent ] : [0, blankFinish]
    }
    
    get2dBlock(top, left, bottom, right, stripIndent) {
	throw new UnimplementedException("get2dblock");
    }
    padDoubleWidth() {
	throw new UnimplementedException("padDoublewidth");
    }
    replace() {
	throw new UnimplementedException("replace");
    }
}

