import UnknownStateError from './UnknownStateError';
import ErrorOutput from './ErrorOutput';
import { isIterable, columnIndicies } from './utils';
import {
 ApplicationError, EOFError, InvalidArgumentsError, UnimplementedError as Unimp,
} from './Exceptions';

export class TransitionCorrection extends Error {
    constructor(...args) {
        super(...args);
        this.args = args;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, TransitionCorrection);
        }
    }
}
export class UnexpectedIndentationError extends Error {
}
export class StateCorrection extends Error {
    constructor(...args) {
        super(...args);
        this.args = args;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, StateCorrection);
        }
    }
}

function __getClass(object) {
  return Object.prototype.toString.call(object)
    .match(/^\[object\s(.*)\]$/)[1];
}


/* Our original class delegates to its array,
   whereas I'm not sure an Array can be implemented without extending it
*/
export class ViewList extends Array {
    constructor(initlist, source, items, parent, parentOffset) {
        super(...initlist);
        this.items = [];
        this.parent = parent;
        this.parentOffset = parentOffset;

        if (initlist instanceof ViewList) {
//          this.data = [...initlist.data]
            this.items = [...initlist.items];
        } else if (initlist) {
//          this.data = [...initlist]
            if (items) {
                this.items = items;
            } else {
                this.items = [];
                for (let i = 0; i < initlist.length; i += 1) {
                    this.items.push([source, i]);
                }
            }
        }
    }

    source(i) {
        return this.info(i)[0];
    }

    offset(i) {
        return this.info(i)[1];
    }

    disconnect() {
        this.parent = undefined;
    }

    splice(index, num, ...elems) {
        console.log(`enter slice ${index} ${num} [${elems.length}]`);
        console.log(`input: ${JSON.stringify(this)}`);
        const index2 = index;
        const num2 = num;
        const returnAry = [];
        for (let i = index; i < this.length - num; i += 1) {
            if (i < index + num) {
                returnAry.push(this[i]);
            }
            console.log(`setting this[${i}] to this[${i + num}]`);
            this[i] = this[i + num];
        }
        console.log(`setting length to ${this.length - num}`);
        this.length = this.length - num;
        this.push(...elems);
        console.log(`returning ${JSON.stringify(returnAry)}`);
        return new this.constructor(returnAry);
    }

    slice(start, end) {
        const initList = [];
        if (end == null) {
            end = this.length;
        }
        if (typeof start === 'undefined') {
            start = 0;
        }

        for (let i = start; i < Math.min(end, this.length); i += 1) {
            initList.push(this[i]);
        }
        return new this.constructor(initList);
    }

    info(i) {
        if (i === this.items.length && this.items.length > 0) {
            return [this.items[i - 1][0], null];
        }
        /* istanbul ignore if */
        if (i < 0 || i >= this.items.length) {
            throw new ApplicationError('Out of range');
        }
        return this.items[i];
    }

    trimStart(n = 1) {
        /* istanbul ignore if */
        if (n > this.length) {
            // fixme
            // raise IndexError("Size of trim too large; can't trim %s items "
              //               "from a list of size %s." % (n, len(self.data)))
        } else if (n < 0) {
            throw Error('Trim size must be >= 0.');
        }
        for (let i = 0; i < n; i += 1) {
            this.shift();
        }
        if (this.parent) {
            this.parentOffset += n;
        }
    }

    trimEnd(n = 1) {
        /* Remove items from the end of the list, without touching the parent. */
/*        if n > len(self.data):
            raise IndexError("Size of trim too large; can't trim %s items "
                             "from a list of size %s." % (n, len(self.data)))
        elif n < 0:
            raise IndexError('Trim size must be >= 0.')
*/
        for (let i = 0; i < n; i += 1) {
            this.pop();
            this.items.pop();
        }
    }
}

export class StringList extends ViewList {
    trimLeft(trimLength, start = 0, end) {
        if (end === undefined) {
            end = this.length;
        }
        for (let i = start; i < Math.min(end, this.length); i += 1) {
            /* istanbul ignore if */
            if (typeof this[i] === 'undefined') {
                throw new Error(`${i} ${this.length}`);
            }
            this[i] = this[i].substring(trimLength);
        }
    }

    getTextBlock(start, flushLeft) {
        let end = start;
        const last = this.length;
        while (end < last) {
            const line = this[end];
            if (!line.trim()) {
                break;
            }
            if (flushLeft && (line.substring(0, 1) === ' ')) {
                const [source, offset] = this.info(end);
                throw new UnexpectedIndentationError(this.slice(start, end),
                                                     source, offset + 1);
            }
            end += 1;
        }
        return this.slice(start, end);
    }

    getIndented({
 start, untilBlank, stripIndent, blockIndent, firstIndent,
}) {
        if (start == null) {
                start = 0;
        }
        let indent = blockIndent;
        let end = start;
        if (blockIndent != null && firstIndent == null) {
            firstIndent = blockIndent;
        }
        if (firstIndent != null) {
            end += 1;
        }
        const last = this.length;
        let blankFinish;
        while (end < last) {
            const line = this[end];
            if (line && (line[0] !== ' ' || (blockIndent != null && line.substring(0, blockIndent).trim()))) {
                blankFinish = ((end > start) && !this[end - 1].trim());
                break;
            }
            const stripped = line.replace(/^\s*/, '');
            if (!stripped) {
                if (untilBlank) {
                    blankFinish = 1;
                    break;
                }
            } else if (blockIndent == null) {
                const lineIndent = line.length - stripped.length;
                if (indent == null) {
                    indent = lineIndent;
                } else {
                    indent = Math.min(indent, lineIndent);
                }
            }
            end += 1;
        }
        if (end === last) {
            blankFinish = 1;
        }

        const block = this.slice(start, end);
        if (firstIndent != null && block) {
            block[0] = block[0].substring(firstIndent);
        }
        if (indent && stripIndent) {
//          console.log(block.constructor.name);
            block.trimLeft(indent, firstIndent != null ? 1 : 0);
        }

        return [block, indent || 0, blankFinish];
    }

    get2dBlock(top, left, bottom, right, stripIndent) {
        if (typeof stripIndent === 'undefined') {
            stripIndent = true;
        }
        const block = this.slice(top, bottom);
        let indent = right;
        for (let i = 0; i < block.length; i += 1) {
            // get slice from line, care for combining characters
            const ci = columnIndicies(block[i]);
            if (left < 0 || left >= ci.length) {
                left += block[i].length - ci.length;
            } else {
                left = ci[left];
            }
            if (right < 0 || right >= ci.length) {
                right += block[i].length - ci.length;
            } else {
                right = ci[right];
            }
            const line = block[i].substring(left, right).trimEnd();
            block[i] = line;
            if (line) {
                indent = Math.min(indent, line.length - line.trimStart().length);
            }
        }
        if (stripIndent && indent > 0 < right) {
            for (let i = 0; i < block.length; i += 1) {
                block[i] = block[i].substring(indent);
            }
        }
        return block;
    }

    padDoubleWidth() {
        //        throw new Unimp('padDoublewidth');

    }

    replace(old, newStr) {
        for (let i = 0; i < this.length; i++) {
            this[i] = this[i].replace(old, newStr); // fix me !!
        }
    }

    trimTop(n = 1) {
        /* Remove items from the start of the list, without touching the parent. */
        /* istanbul ignore if */
        if (n > this.length) {
            throw new Error(`Size of trim too large; can't trim ${n} items `
                            + `from a list of size ${this.length}`);
        } else if (n < 0) {
            throw new Error('Trim size must be >= 0.');
        }
        this.splice(0, n);
        this.items.splice(0, n);
        if (this.parent) {
            this.parentOffset += n;
        }
    }
}

export class StateMachine {
    /*
        Initialize a `StateMachine` object; add state objects.

       Parameters:

        - `state_classes`: a list of `State` (sub)classes.
        - `initial_state`: a string, the class name of the initial state.
        - `debug`: a boolean; produce verbose output if true (nonzero).
        */

    constructor({
 stateClasses, initialState, debug, debugFn,
}) {
        /* Perform some sanity checking on arguments */
        /* istanbul ignore if */
        if (stateClasses == null || stateClasses.length === 0) {
            throw new InvalidArgumentsError('stateClasses');
        }
        /* Initialize instance junk that we can't do except through
           this method. */
        this._init();
        if (!debug) {
            debug = false;
        }
        if (debug && !debugFn) {
            // throw new Error("unexpected lack of debug function");
            debugFn = console.log;
        }
        this.debugFn = debugFn;
        this.inputLines = undefined;
        this.inputOffset = 0;
        this.line = undefined;
        this.lineOffset = -1;
        this.debug = debug;
        this.initialState = initialState;
        this.currentState = initialState;
        this.states = {};
        this.addStates(stateClasses);
        this.observers = [];
        this._stderr = new ErrorOutput();
    }

    _init() {
        // ??
    }

    unlink() {
        Object.values(this.states).forEach(s => s.unlink());
        this.states = undefined;
    }

    /* Faithful to python implementation. */
    run({
 inputLines, inputOffset, context, inputSource, initialState,
}) {
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
        if (inputLines instanceof StringList) {
            this.inputLines = inputLines;
//          console.log(inputLines);
        } else if (inputLines == null) {
            throw new InvalidArgumentsError('inputLines should not be null or undefined');
        } else {
            if (!isIterable(inputLines)) {
                inputLines = [inputLines];
            }
            /* note: construct stringist with inputSource */

            this.inputLines = new StringList(inputLines, inputSource);
//          console.log(this.inputLines);
        }
        this.inputOffset = inputOffset;
        this.lineOffset = -1;
        this.currentState = initialState || this.initialState;
        if (!this.currentState) {
            console.log('No current state');
        }
        if (this.debug) {
            this.debugFn(`\nStateMachine.run: input_lines (line_offset=${this.lineOffset}):\n| ${this.inputLines.join('\n| ')}`);
        }
        let transitions;
        const results = [];
        let state = this.getState();
        let nextState;
        let result;
        try {
            if (this.debug) {
                this.debugFn('\nStateMachine.run: bof transition');
            }
            [context, result] = state.bof(context);
            if (!Array.isArray(context)) {
                throw new Error('expecting array');
            }
//          console.log(context);
            results.push(...result);
            while (true) {
                const doContinue = false;
                try {
                    try {
                        this.nextLine();
                        if (this.debug) {
                            if (Number.isNaN(this.lineOffset)) {
                                /* istanbul ignore if */
                                throw new Error();
                            }

                            const rinfo = this.inputLines.info(
                                this.lineOffset,
);
                            if (!isIterable(rinfo)) {
                                /* istanbul ignore if */
                                throw new Error();
                            }
                            const [source, offset] = rinfo;
                            this.debugFn(`\nStateMachine.run: line (source=${source}, offset=${offset}):\n| ${this.line}`);
                        }
//                      console.log(context);
                        /* istanbul ignore if */
                        if (!Array.isArray(context)) {
                            throw new Error('context should be array');
                        }

                        const r = this.checkLine(context, state, transitions);
                        /* istanbul ignore if */
                        if (!isIterable(r)) {
                            throw new Error(`Expect iterable result, got: ${r}`);
                        }
                        [context, nextState, result] = r;
                        /* istanbul ignore if */
                        if (!Array.isArray(context)) {
                            throw new Error('context should be array');
                        }
                        /* istanbul ignore if */
                        if (!isIterable(result)) {
                            throw new Error(`Expect iterable result, got: ${result}`);
                        }
                        results.push(...result);
                    } catch (error) {
                        if (error instanceof EOFError) {
                            if (this.debug) {
                                this.debugFn(`\nStateMachine.run: ${state.constructor.name}.eof transition`);
                            }
                            result = state.eof(context);
                            results.push(...result);
                            break;
                        } else {
                            throw error;
                        }
                    }
                } catch (error) {
                    if (error instanceof TransitionCorrection) {
                        this.previousLine();
                        transitions = [error.args[0]];
                        /* if self.debug:
                        print >>self._stderr, (
                              '\nStateMachine.run: TransitionCorrection to '
                              'state "%s", transition %s.'
                              % (state.__class__.__name__, transitions[0])) */
                        /* Cant continue, makes no sense? ??  */
                        continue;
                    } else if (error instanceof StateCorrection) {
                        this.previousLine();
                        nextState = error.args[0];
                        if (error.args.length === 1) {
                            transitions = null;
                        } else {
                            transitions = [error.args[1]];
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
                /* we need this somehow, its part of a try, except, else */
                // transitions = undefined
                state = this.getState(nextState);
            }
        } catch (error) {
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
        if (nextState) {
            if (this.debug && nextState !== this.currentState) {
                this.debugFn(`StateMachine.getState: changing state from "${this.currentState}" to "${nextState}" (input line ${this.absLineNumber()})`);
            }
            this.currentState = nextState;
        }
        if (typeof this.states[this.currentState] === 'undefined') {
            throw new UnknownStateError(this.currentState);
        }
        return this.states[this.currentState];
    }

    /* Load `self.line` with the `n`'th next line and return it. */
    nextLine(n = 1) {
// /     console.log('*** advancing to next line');
        this.lineOffset += n;
        if (this.lineOffset >= this.inputLines.length) {
            this.line = null;
            this.notifyObservers();
            throw new EOFError();
        }

        this.line = this.inputLines[this.lineOffset];
        this.notifyObservers();
//      console.log(`line is "${this.line}"`);
        return this.line;
    }

    isNextLineBlank() {
        return !(this.inputLines[this.lineOffset + 1].trim());
    }

    atEof() {
        return this.lineOffset >= this.inputLines.length - 1;
    }

    atBof() {
        return this.lineOffset <= 0;
    }

    previousLine(n = 1) {
        this.lineOffset -= n;
        if (this.lineOffset < 0) {
            this.line = null;
        } else {
            this.line = this.inputLines[this.lineOffset];
        }
        this.notifyObservers();
        return this.line;
    }

    gotoLine(lineOffset) {
        this.lineOffset = lineOffset - this.inputOffset;
        this.line = this.inputLines[this.lineOffset];
        this.notifyObservers();
        return this.line;
    }

    getSource(lineOffset) {
        return this.inputLines.source(lineOffset - this.inputOffset);
    }

    absLineOffset() {
        return this.lineOffset + this.inputOffset;
    }

    absLineNumber() {
        return this.lineOffset + this.inputOffset + 1;
    }

    getSourceAndLine(lineno) {
        let offset; let srcoffset; let srcline; let
src;
        if (lineno === undefined) {
            offset = this.lineOffet;
        } else {
            offset = lineno - this.inputOffset - 1;
        }
        try {
            [src, srcoffset] = this.inputLines.info(offset);
            srcline = srcoffset + 1;
        } catch (error) {
            // ??
        }
        return [src, srcline];
    }

    atEof() {
        return this.lineOffset >= this.inputLines.length - 1;
    }

    atBof() {
        return this.lineOffset <= 0;
    }

    previousLine(n = 1) {
        this.lineOffset -= n;
        if (this.lineOffset < 0) {
            this.line = null;
        } else {
            this.line = this.inputLines[this.lineOffset];
        }
        this.notifyObservers();
        return this.line;
    }

    gotoLine(lineOffset) {
        this.lineOffset = lineOffset - this.inputOffset;
        this.line = this.inputLines[this.lineOffset];
        this.notifyObservers();
        return this.line;
    }

    getSource(lineOffset) {
        return this.inputLines.source(lineOffset - this.inputOffset);
    }

    absLineOffset() {
        return this.lineOffset + this.inputOffset;
    }

    absLineNumber() {
        return this.lineOffset + this.inputOffset + 1;
    }

    getSourceAndLine(lineno) {
        let offset; let srcoffset; let srcline; let
src;
        if (lineno === undefined) {
            offset = this.lineOffet;
        } else {
            offset = lineno - this.inputOffset - 1;
        }
        try {
            [src, srcoffset] = this.inputLines.info(offset);
            srcline = srcoffset + 1;
        } catch (error) {
            // ??
        }
        return [src, srcline];
    }

    insertInput(inputLines, source) {
        throw new Unimp();
    }

    getTextBlock(flushLeft = false) {
        let block;
        try {
            block = this.inputLines.getTextBlock(this.lineOffset,
                                                 flushLeft);
            this.nextLine(block.length - 1);
            return block;
        } catch (error) {
            if (error instanceof UnexpectedIndentationError) {
                block = error.args[0];
                this.nextLine(block.length - 1); // advance to last line of block
            }
            throw error;
        }
    }

    checkLine(context, state, transitions) {
        /* istanbul ignore if */
        if (!Array.isArray(context)) {
            throw new Error('context should be array');
        }
        if (this.debug) {
            this.debugFn(`\nStateMachine.check_line: state="${state.constructor.name}", transitions=${transitions}.`);
        }
        // console.log(`checking line ${this.line}`);
        if (transitions === undefined) {
            transitions = state.transitionOrder;
        }
        const stateCorrection = true;
//      if(transitions.length === 0) {
//          throw new Error("no transitions");
//      }

        //        console.log(transitions);
        for (const name of transitions) {
            const [pattern, method, nextState] = state.transitions[name];
            //      console.log(method);
//          console.log(`checkLine: ${name} ${pattern} ${nextState}`);
            const result = pattern.exec(this.line);
            if (result) {
                if (this.debug) {
                    this.debugFn(`\nStateMachine.checkLine: Matched transition '"${name}" in state "${state.constructor.name}`);
                }
//              console.log(`pattern match for ${name}`);
                const r = method.bind(state)({ pattern, result, input: this.line }, context, nextState);
                /* istanbul ignore if */
                if (r === undefined) {
                        throw new Error();
                }
//              console.log(`return is >>> `);
//              console.log(r);
                return r;
            }
        }
        return state.noMatch(context, transitions);
    }

    addState(stateClass) {
        const stateName = stateClass.name;
//      console.log(`adding state ${stateName}`);

        if (Object.hasOwnProperty(this.states, stateName)) {
            throw new DuplicateStateError(stateName);
        }
        const r = new stateClass({ stateMachine: this, debug: this.debug });
        this.states[stateName] = r;
    }

    addStates(stateClasses) {
        if (!stateClasses) {
            throw new Error('');
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
        let observer;
        for (const observer of this.observers) {
            /* istanbul ignore if */
            if (observer === undefined) {
                throw new ApplicationError('undefined observer');
            }
            try {
                let info = [];
                try {
                    info = this.inputLines.info(this.lineOffset);
                } catch (err) {
                    /* Empty */
                }
                /* istanbul ignore if */
                if (info === undefined) {
                    // throw new Error("undefined info");
                    continue;
                }
                if (!isIterable(info)) {
                    throw new Error('isIterable');
                }
                observer(...info);
            } catch (err) {
                console.log(err.stack);
            }
        }
    }
}

export class State {
    constructor(args) {
        const { stateMachine, debug } = args;
        this._init(args);
        this.transitionOrder = [];
        this.transitions = {};
        // this.patterns = {}
        // this.initialTransitions = args.initialTransitions;
        // this.wsInitialTransitions = args.wsInitialTransitions;

        this.addInitialTransitions();
        /* istanbul ignore if */
        if (!stateMachine) {
            throw new Error('Need statemachine');
        }

        this.stateMachine = stateMachine;
        this.debug = debug;

        if (!this.nestedSm) {
            this.nestedSm = this.stateMachine.constructor;
        }
        // fix me - this needs revision
        /* istanbul ignore if */
        if (!this.nestedSmKwargs) {
            console.log('I am bogus');
            throw new Error();
            this.nestedSmKwargs = {
                stateClasses: [this.constructor],
                initialState: this.constructor.name,
                debug: this.debug,
                debugFn: this.debugFn,
            };
        }
    }

    _init() {
            /* empty */
        this.patterns = {};
        this.initialTransitions = null;
        this.nestedSm = null;
    }

    runtimeInit() {
        /* empty */
    }

    unlink() {
        this.stateMachine = undefined;
    }

    addInitialTransitions() {
        if (this.initialTransitions) {
            const [names, transitions] = this.makeTransitions(this.initialTransitions);
            this.addTransitions(names, transitions);
        }
    }

    addTransitions(names, transitions) {
        names.forEach(((name) => {
            if (name in this.transitions) {
                throw new DuplicateTransitionError(name);
            }
            if (!(name in transitions)) {
                throw new UnknownTrransitionError(name);
            }
        }));
        this.transitionOrder.splice(0, 0, ...names);
        Object.keys(transitions).forEach((key) => {
            this.transitions[key] = transitions[key];
        });
    }

    addTransition(name, transition) {
        throw new Unimp();
    }

    removeTransition(name) {
        throw new Unimp();
    }

    makeTransition(name, nextState) {
        if (name == null) {
            throw new InvalidArgumentsError('need transition name');
        }
        if (nextState === undefined) {
            nextState = this.constructor.name;
        }

        let pattern = this.patterns[name];
        if (!(pattern instanceof RegExp)) {
            try {
                pattern = new RegExp(`^${pattern}`);
            } catch (error) {
                throw error;
            }
        }
        if (typeof (this[name]) !== 'function') {
            throw new Error(`cant find method ${name} on ${this.constructor.name}`);
        }

        const method = this[name];

        return [pattern, method, nextState];
    }

    makeTransitions(nameList) {
        const names = [];
        const transitions = {};
        /* istanbul ignore if */
        if (!Array.isArray(nameList)) {
            console.log('warning, not an array');
            throw new Error('not array');
        }

        /* check what happens with throw inside here */
        nameList.forEach((namestate) => {
            if (namestate == null) {
                /* istanbul ignore if */
                throw new InvalidArgumentsError('nameList contains null');
            }
            if (!Array.isArray(namestate)) {
                transitions[namestate] = this.makeTransition(namestate);
                names.push(namestate);
            } else {
                transitions[namestate[0]] = this.makeTransition(...namestate);
                names.push(namestate[0]);
            }
        });

        return [names, transitions];
    }

    noMatch(context, transitions) {
        return [context, null, []];
    }

    bof(context) {
        return [context, []];
    }

    eof(context) {
        return [];
    }

    nop(match, context, nextState) {
        return [context, nextState, []];
    }
}

export class StateMachineWS extends StateMachine {
    getIndented({ untilBlank, stripIndent }) {
        if (stripIndent === undefined) {
            stripIndent = true;
        }
        let offset = this.absLineOffset();
        const [indented, indent, blankFinish] = this.inputLines.getIndented({
            start: this.lineOffset,
            untilBlank,
            stripIndent,
});
        if (indented) {
            this.nextLine(indented.length - 1);
        }
        while (indented && indented.length && !(indented[0].trim())) {
            indented.trimStart();
            offset += 1;
        }
        return [indented, indent, offset, blankFinish];
    }

    getKnownIndented({ indent, untilBlank, stripIndent }) {
        let indented; let
blankFinish;
        if (stripIndent === undefined) {
            stripIndent = true;
        }
        let offset = this.absLineOffset();
        [indented, indent, blankFinish] = this.inputLines.getIndented({
 start: this.lineOffset, untilBlank, stripIndent, blockIndent: indent,
});
        this.nextLine(indented.length - 1);
        while (indented.length && !(indented[0].trim())) {
            indented.trimStart();
            offset += 1;
        }
        return [indented, offset, blankFinish];
    }

    getFirstKnownIndented({
 indent, untilBlank, stripIndent, stripTop,
}) {
        let indented;
        let blankFinish;
        if (stripIndent === undefined) {
            stripIndent = true;
        }
        if (stripTop === undefined) {
            stripTop = true;
        }
        let offset = this.absLineOffset();
        [indented, indent, blankFinish] = this.inputLines.getIndented({
            start: this.lineOffset,
untilBlank,
stripIndent,
            firstIndent: indent,
});
        this.nextLine(indented.length - 1);
        if (stripTop) {
            while (indented.length && !(indented[0].trim())) {
                indented.trimStart();
                offset += 1;
            }
        }
        return [indented, indent, offset, blankFinish];
    }
}

export class StateWS extends State {
    constructor(args) {
        super(args);
        if (!this.indentSm) {
            this.indentSm = this.nestedSm;
        }
        if (!this.indentSmKwargs) {
            this.indentSmKwargs = this.nestedSmKwargs;
        }
        if (!this.knownIndentSm) {
            this.knownIndentSm = this.indentSm;
        }
        if (!this.knownIndentSmKwargs) {
            this.knownIndentSmKwargs = this.indentSmKwargs;
        }
    }

    _init(args) {
        super._init(args);
        this.indentSm = null;
        this.indentSmKwargs = null;
        this.knownIndentSm = null;
        this.knownIndentSmKwargs = null;
        this.wsPatterns = {
 blank: ' *$',
                           indent: ' +',
};
        this.wsInitialTransitions = ['blank', 'indent'];
    }

    addInitialTransitions() {
        super.addInitialTransitions();
        if (!this.patterns) {
            this.patterns = {};
        }
        this.patterns = { ...this.patterns, ...this.wsPatterns };
        const [names, transitions] = this.makeTransitions(this.wsInitialTransitions);
        this.addTransitions(names, transitions);
    }

    blank(match, context, nextState) {
        return this.nop(match, context, nextState);
    }

    indent(match, context, nextState) {
        const [indented, indent, lineOffset, blankFinish] = this.stateMachine.getIndented({});
        const IndentSm = this.indentSm;
        console.log('instantiating indentsm');
        console.log(this.indentSmKwargs);
        const sm = new IndentSm({ debug: this.debug, ...this.indentSmKwargs });
        if (!sm.run) {
            console.log(Object.keys(sm));
            throw Error(`no sm run ${this} ${IndentSm.constructor.name}`);
        }

        const results = sm.run({ indented, inputOffset: lineOffset });
        return [context, nextState, results];
    }

    knownIndent(match, context, nextState) {
        const [indetned, ineOffset, blankFinish] = this.stateMachine.getKnownIndented(
            match.end(),
);
        const knownIndentSm = this.knownIdentSm;
        const sm = new knownIndentSm({
 debug: this.debug,
                                       ...this.knownIndentSmKwargs,
});
        const results = sm.run({ indented, inputOffset: lineOffset });
        return [context, nextState, results];
    }

    firstKnownIndent(match, context, nextState) {
        const [indented, lineOffset, blankFinish] = this.stateMachine.getFirstKnownIndented({ indent: match.result.index + match.result[0].length });
        const KnownIndentSm = this.knownIndentSm;
        const sm = new KnownIndentSm({ debug: this.debug, ...this.knownIndentSmKwargs });
        const results = sm.run({ indented, inputOffset: lineOffset });
        return [context, nextState, results];
    }
}

function expandtabs(string) {
    let tabIndex;
    while ((tabIndex = string.indexOf('\t')) !== -1) {
        string = string.substring(0, tabIndex) + Array(8 - (tabIndex % 8)).fill(' ').join('') + string.substring(tabIndex + 1);
    }
    return string;
}
export function string2lines(astring, args) {
    if (!astring) {
        astring = '';
    }
    if (!args) {
        args = {};
    }

    let { tabWidth, convertWhitespace, whitespace } = args;
    if (whitespace === undefined) {
        /* empty */
    }
    if (tabWidth === undefined) {
        tabWidth = 8;
    }
    const result = astring.split('\n');
    if (astring[astring.length - 1] === '\n') {
        result.pop();
    }
    return result.map(expandtabs);
}
