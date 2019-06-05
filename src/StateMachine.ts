import UnknownStateError from './UnknownStateError';
import ErrorOutput from './ErrorOutput';
import {isIterable} from './utils';
import {ApplicationError, EOFError, InvalidArgumentsError, UnimplementedError as Unimp,} from './Exceptions';
import UnexpectedIndentationError from './UnexpectedIndentationError';
import StateCorrection from './StateCorrection';
import TransitionCorrection from './TransitionCorrection';
import DuplicateStateError from './DuplicateStateError';
import StringList from './StringList';
import {IStateFactory, IStateMachine} from "./types";

class StateMachine implements IStateMachine {
    public memo: any;
    protected states: any;
    public inputLines: StringList;
    /*
        Initialize a `StateMachine` object; add state objects.

       Parameters:

        - `stateClasses`: a list of `State` (sub)classes.
        - `initialState`: a string, the class name of the initial state.
        - `debug`: a boolean; produce verbose output if true (nonzero).
        */

    stateFactory: IStateFactory;

    lineOffset: number;

    line: string;
    inputOffset: number;

    constructor(args: {
        stateFactory: IStateFactory, initialState: string; debug?: boolean, debugFn?: any,
}) {
        /* Perform some sanity checking on arguments */
//        /* istanbul ignore if */
//        if (stateClasses == null || stateClasses.length === 0) {
//            throw new InvalidArgumentsError('stateClasses');
//        }
        /* Initialize instance junk that we can't do except through
           this method. */
        this._init();
        if (!debug) {
            debug = false;
        }
        if (debug && !debugFn) {
            // throw new Error("unexpected lack of debug function");
            /* eslint-disable-next-line no-console */
            debugFn = console.log;
        }
        this.stateFactory = stateFactory;
        this.debugFn = debugFn;
        this.inputLines = undefined;
        this.inputOffset = 0;
        this.line = undefined;
        this.lineOffset = -1;
        this.debug = debug;
        this.initialState = initialState;
        this.currentState = initialState;
        this.states = {};
        if (!stateFactory) {
            throw new Error('need statefactory');
        }

        const stateClasses = stateFactory.getStateClasses();
//      console.log(typeof stateClasses);
        if (!isIterable(stateClasses)) {
            throw new Error(`expecting iterable, got ${stateClasses}`);
        }
//      console.log(stateClasses);
        this.addStates(stateClasses);
        this.observers = [];
        this._stderr = new ErrorOutput();
    }

    _init() {
        // do-nothing
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
            // console.log('No current state');
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
            /* eslint-disable-next-line no-constant-condition */
            while (true) {
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
                        /* eslint-disable-next-line no-continue */
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

    getSource(lineOffset: number): string {
        return this.inputLines.source(lineOffset - this.inputOffset);
    }

    absLineOffset(): number {
        return this.lineOffset + this.inputOffset;
    }

    absLineNumber(): number {
        return this.lineOffset + this.inputOffset + 1;
    }

    getSourceAndLine(lineno?: number) {
        let offset;
        let srcoffset;
        let srcline;
        let
            src;
        if (lineno === undefined) {
            offset = this.lineOffset;
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


    /* eslint-disable-next-line no-unused-vars */
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
        if (transitions === undefined) {
            transitions = state.transitionOrder;
        }
        /* eslint-disable-next-line no-unused-vars */
        const stateCorrection = true;

        /* eslint-disable-next-line no-restricted-syntax */
        for (const name of transitions) {
            // how is this initialized?
            const [pattern, method, nextState] = state.transitions[name];
            const result = pattern.exec(this.line);
            if (result) {
                if (this.debug) {
                    this.debugFn(`\nStateMachine.checkLine: Matched transition '"${name}"`
                        + `in state "${state.constructor.name}`);
                }
//              console.log(`pattern match for ${name}`);
                const r = method.bind(state)({pattern, result, input: this.line},
                    context, nextState);
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
        if (typeof stateClass === 'undefined') {
            // throw new InvalidArgumentsError('stateClass should be a class');
            return;
        }
        let stateName;
        if (typeof stateClass === 'string') {
            stateName = stateClass;
        } else {
            stateName = stateClass.stateName;
        }
        // console.log(`adding state ${stateName}`);

        if (Object.prototype.hasOwnProperty.call(this.states, stateName)) {
            throw new DuplicateStateError(stateName);
        }
        if (!stateName) {
            throw new Error(`need statename for ${stateClass}`);
        }

        const r = this.stateFactory.createState(stateName, this);
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
        /* eslint-disable-next-line no-restricted-syntax */
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
                    /* eslint-disable-next-line no-continue */
                    continue;
                }
                if (!isIterable(info)) {
                    throw new Error('isIterable');
                }
                observer(...info);
            } catch (err) {
                /* eslint-disable-next-line no-console */
                console.log(err.stack);
            }
        }
    }
}


function expandtabs(string) {
    let tabIndex;
    /* eslint-disable-next-line no-cond-assign */
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

    /* eslint-disable-next-line no-unused-vars,prefer-const */
    let { tabWidth, convertWhitespace, whitespace } = args;
    /* eslint-disable-next-line no-empty */
    if (whitespace === undefined) {
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

export { StateMachine };
