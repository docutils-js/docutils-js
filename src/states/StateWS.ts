import State from './State';
import StateMachineWS from "../StateMachineWS";
import { RSTStateArgs, StatemachineConstructor } from "../parsers/rst/types";
import { InvalidStateError } from "../Exceptions";
import {
    CreateStateMachineFunction,
    DebugFunction,
    Statemachine,
    StateMachineConstructorArgs,
    StateMachineFactoryFunction
} from "../types";

/**
 * State superclass specialized for whitespace (blank lines & indents).
 *
 * Use this class with `StateMachineWS`.  The transitions 'blank' (for blank
 * lines) and 'indent' (for indented text blocks) are added automatically,
 * before any other transitions.  The transition method `blank()` handles
 * blank lines and `indent()` handles nested indented blocks.  Indented
 * blocks trigger a new state machine to be created by `indent()` and run.
 * The class of the state machine to be created is in `indent_sm`, and the
 * constructor keyword arguments are in the dictionary `indent_sm_kwargs`.
 *
 * The methods `known_indent()` and `firstknown_indent()` are provided for
 * indented blocks where the indent (all lines' and first line's only,
 * respectively) is known to the transition method, along with the attributes
 * `known_indent_sm` and `known_indent_sm_kwargs`.  Neither transition method
 * is triggered automatically.
 **/
class StateWS extends State {
    /**
     * The `StateMachine` class handling indented text blocks.
     *
     * If left as ``None``, `indent_sm` defaults to the value of
     * `State.nested_sm`.  Override it in subclasses to avoid the default.
     */
    //public indentSm: StatemachineConstructor<Statemachine> | undefined;
    /**
     *  Keyword arguments dictionary, passed to the `indent_sm` constructor.
     *
     * If left as ``None``, `indent_sm_kwargs` defaults to the value of
     * `State.nested_sm_kwargs`. Override it in subclasses to avoid the default.
     **/
    //public indentSmKwArgs: {} | undefined;

    /**
     *    The `StateMachine` class handling known-indented text blocks.
     *
     * If left as ``None``, `known_indent_sm` defaults to the value of
     * `indent_sm`.  Override it in subclasses to avoid the default.
     */
    //public knownIndentSm: StatemachineConstructor<Statemachine> | undefined;
    /**
     * Keyword arguments dictionary, passed to the `known_indent_sm` constructor.
     *
     * If left as ``None``, `known_indent_sm_kwargs` defaults to the value of
     * `indent_sm_kwargs`. Override it in subclasses to avoid the default.
     */
    //public knownIndentSmKwargs: StateMachineConstructorArgs | undefined;

    /** Patterns for default whitespace transitions.  May be overridden in subclasses. */
    private wsPatterns: any;

    /**
     * Default initial whitespace transitions, added before those listed in
     * `State.initial_transitions`.  May be overridden in subclasses.
     */
    private wsInitialTransitions: string[] | undefined;
    //protected nestedSm: StatemachineConstructor<Statemachine> | undefined;
    private wsStateMachine: StateMachineWS;
    private debugFn: DebugFunction = (line) => {};
    public createIndentedStateMachine: StateMachineFactoryFunction<Statemachine> | undefined;
    public constructor(stateMachine: StateMachineWS, debug: boolean = false) {
        super(stateMachine, debug);
        this.wsStateMachine = stateMachine;
        /* istanbul ignore else */
        /*
        if (!this.indentSm) {
            this.indentSm = this.nestedSm;
        }*/
        /* istanbul ignore else */
        /*if (!this.indentSmKwargs) {
            this.indentSmKwargs = this.nestedSmKwargs;
        }*/
        /* istanbul ignore else */
        /*if (!this.knownIndentSm) {
            this.knownIndentSm = this.indentSm;
        }*/
        /* istanbul ignore else */
        /*if (!this.knownIndentSmKwargs) {
            this.knownIndentSmKwargs = this.indentSmKwargs;
        }*/
    }

    public _init(stateMachine: any, args: any) {
        super._init(stateMachine, args);
        /*this.indentSm = undefined;
        this.indentSmKwargs = null;
        this.knownIndentSm = undefined;
        this.knownIndentSmKwargs = undefined;
        */this.wsPatterns = {
            blank: ' *$',
            indent: ' +',
        };
        this.wsInitialTransitions = ['blank', 'indent'];
    }

    public addInitialTransitions() {
        super.addInitialTransitions();
        this.patterns = {...this.patterns, ...this.wsPatterns};
        if(this.wsInitialTransitions === undefined) {
            throw new InvalidStateError();
        }
        const [names, transitions] = this.makeTransitions(this.wsInitialTransitions);
        this.addTransitions(names, transitions);
    }

    public blank(match: any, context: any[], nextState: any) {
        return this.nop(match, context, nextState);
    }

    public indent(match: any, context: any[], nextState: any) {
        /* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
        const [indented, indent, lineOffset, blankFinish] = this.wsStateMachine.getIndented({});
        if(!this.createIndentStateMachine) {
            throw new InvalidStateError('createIndentStateMachine');
        }
        const sm = this.createIndentStateMachine();
        const results = sm.run( indented, lineOffset );
        return [context, nextState, results];
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
    public knownIndent(match: any, context: any[], nextState: any) {
        /* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
        const [indented, lineOffset, blankFinish] = this.wsStateMachine.getKnownIndented(
            match.end(),
        );
        if(this.createKnownIndentStateMachine === undefined) {

            throw new InvalidStateError("Need knownIndentSm");
        }

        const sm = this.createKnownIndentStateMachine();
        const results = sm.run(indented, lineOffset );
        return [context, nextState, results];
    }
    /**
     * Handle an indented text block (first line's indent known).
     *
     * Extend or override in subclasses.
     *
     * Recursively run the registered state machine for known-indent indented
     * blocks (`self.known_indent_sm`). The indent is the length of the
     * match, ``match.end()``.
     */
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
    public firstKnownIndent(match: any, context: any[], nextState: any) {
        /* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
        const [indented, lineOffset, blankFinish] = this.wsStateMachine.getFirstKnownIndented(
            {
                indent: match.result.index + match.result[0].length,
            },
        );
        let sm: Statemachine;
        if(this.createKnownIndentStateMachine !== undefined) {
            sm = this.createKnownIndentStateMachine();

            const results = sm.run(indented, lineOffset );
            return [context, nextState, results];
        } else {
            throw new InvalidStateError('createKnownIndentStateMAchine');
        }
    }
}

export default StateWS;
