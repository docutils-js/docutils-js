import UnknownStateError from './UnknownStateError';
import ErrorOutput from './ErrorOutput';

export class StateMachine {
    /* 
        Initialize a `StateMachine` object; add state objects.

       Parameters:

        - `state_classes`: a list of `State` (sub)classes.
        - `initial_state`: a string, the class name of the initial state.
        - `debug`: a boolean; produce verbose output if true (nonzero).
	*/

    constructor({ stateClasses, initialState, debug }) {
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

    unlink() {
	Object.values(this.states).forEach(s => s.unlink());
	this.states = undefined;
    }

    run({ inputLines, inputOffset, context, inputSource, initialStat}) {
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
	//else:
	//self.input_lines = StringList(input_lines, source=input_source)
	this.inputLines = inputLines;
	this.lineOffset = -1;
	this.currentState = initialState || this.initialState;
	let transitions = undefined;
	const results = [];
	let state = this.getState();
	let nextState;
	try {
	    [ context, result ] = state.bof(context);
	    results.push(result);
	    while(true) {
		try {
		    try {
			this.nextLine();
			[ context, nextState, result ] = this.checkLine(context, state, transitions);
		    }
		    catch(error) {
		    }
		}
		catch(error) {
		}
	    }
	}
	catch(error) {
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
	if(!this.states.hasOwnProperty(self.currentState)) {
	    throw new UnknownStateError(self.currentState);
	}
	return this.states[self.currentState];
    }

    /* Load `self.line` with the `n`'th next line and return it.*/
    nextLine(n=1) {
	this.lineOffset += n;
	if(this.lineOffset >= this.inputLines.length) {
	    self.line = null;
	    this.notifyObservers()
	    throw EOFError;
	}
	
	this.line = this.inputLines[this.lineOffset];
	this.notifyObservers()
	return this.line;
    }

    isNextLineBlank() {
	return !(this.inputLines[self.lineOffset + 1].trim());
    }
    
    atEof() {
	return this.lineOffset >= self.inputLines.length - 1
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
	self.notifyObservers()
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
	return this.lineOffset >= self.inputLines.length - 1
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
	self.notifyObservers()
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
}

getTextBlock() {
}
checkLine() {
}
addState() {
}

    addStates(stateClasses) {
	stateClasses.forEach(this.addState);
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
	this.observers.forEach(o =>  {
	    let info;
	    try {
		 info = this.inputLines.info(this.lineOffset);
	    } catch(err) {
	    }
	    o(...info);
	});
    }
}

export class State {
    constructor(stateMachine,debug) {
	this.transitionOrder = []
	this.transitions = {}
	this.addInitialTransitions()
	this.stateMachine = stateMachine;
	this.debug = debug;
	if(!this.nestedSm){
	    this.nestedSm = this.stateMachine.__class__;
	}
	if(!this.nestedSmKwargs) {
	    this.nestedSmKwargs = { stateClasses: [this.__class__],
				    initialState: this.__class__.__name__};
	}
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
	names.forEach(name => {
	    if(this.transitons.includes(name)) {
		throw new DuplicateTransitionError(name);
	    }
	    if(!transitions.includes(name)) {
		throw new UnknownTrransitionError(name);
	    }
	});
	this.transitionOrder.push(...names);
	this.transitions.update(transitions);
    }

    addTransition(name, transition) {
    }

    removeTransition(name) {
    }

    makeTransition(name, nextState) {
    }

    makeTransitions(nameList) {
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
	[ indented, indent, blankFinish ] = this.inputLines.getIndented({ lineOffset: this.lineOffset, untilBlank, stripIndent, blockIndent: indent });
	this.nextLine(indented.length - 1);
	while(indented && !(indented[0].trim())) {
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
    constructor(stateMachine, debug) {
	super(stateMachine, debug);
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
    addInitialTransitions() {
	super.addInitialTransitions();
	if(!this.patterns) {
	    this.patterns = {}
	}
	this.patterns = { ...this.patterns, ... this.wsPatterns };
	const [ names, transitions ] = this.makeTransitions(this.wsInitiaTransitions);
	this.addTransitions(names, transtions);
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
    let { tabWidth, convertWhitespace, whitespace } = args;
    if(whitespace === undefined) {
    }
    if(tabWidth === undefined) {
	tabWidth = 8;
    }
    /* fo a bunch of stuff */
    return astring.split('\n').map(x => x);
}
