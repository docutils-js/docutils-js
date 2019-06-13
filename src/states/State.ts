import { InvalidArgumentsError } from "../Exceptions";
import UnknownTransitionError from "../error/UnknownTransitionError";
import DuplicateTransitionError from "../error/DuplicateTransitionError";
import { ReporterInterface, StateInterface, Transitions } from "../types";
import { StateMachine } from "../StateMachine";
import { RSTStateArgs } from "../parsers/rst/types";

class State implements StateInterface {
    /**
      * {Name: pattern} mapping, used by `make_transition()`. Each pattern may
      * be a string or a compiled `re` pattern. Override in subclasses.
     */
    public patterns?: {};
    /**
     * A list of transitions to initialize when a `State` is instantiated.
     * Each entry is either a transition name string, or a (transition name, next
     * state name) pair. See `make_transitions()`. Override in subclasses.
     */
    protected initialTransitions?: string[] | string[][];


    protected indentSm?: any;
    protected nestedSm?: any;
    protected nestedSmKwargs?: any;

    protected knownIndentSm: any;
    protected debug?: boolean;
    protected knownIndentSmKwargs: any;
    protected indentSmKwargs: any;

    public transitionOrder: string[] = [];
    protected transitions: Transitions = { };
    protected reporter?: ReporterInterface;
    private stateMachine?: StateMachine;

    public constructor(stateMachine: StateMachine, args: { debug?: boolean}) {
        this.stateMachine = stateMachine;
        this.debug = args.debug;
        this._init(stateMachine, args);

        this.addInitialTransitions();
        /* istanbul ignore if */
        if (!stateMachine) {
            throw new Error('Need statemachine');
        }


        if (!this.nestedSm) {
            this.nestedSm = this.stateMachine.constructor;
        }
        // fix me - this needs revision
        /* istanbul ignore if */
        if (!this.nestedSmKwargs) {
            // console.log('I am bogus');
            throw new Error();
            /*
            this.nestedSmKwargs = {
                stateClasses: [this.constructor],
                initialState: this.constructor.name,
                debug: this.debug,
                debugFn: this.debugFn,
            };
*/
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars
    public _init(stateMachine: StateMachine, args: RSTStateArgs) {
        /* empty */
        this.patterns = {};
        this.initialTransitions = undefined;
        this.nestedSm = null;
    }

    public runtimeInit(): void {
        /* empty */
    }

    public unlink(): void {
        this.stateMachine = undefined;
    }

    public addInitialTransitions(): void {
        if (this.initialTransitions) {
            const [names, transitions] = this.makeTransitions(this.initialTransitions);
            this.addTransitions(names as any[], transitions);
        }
    }

    public addTransitions(names: string[], transitions: Transitions): void {
        names.forEach(((name) => {
            if (name in this.transitions) {
                throw new DuplicateTransitionError(name);
            }
            if (!(name in transitions)) {
                throw new UnknownTransitionError(name);
            }
        }));
        this.transitionOrder.splice(0, 0, ...names);
        Object.keys(transitions).forEach((key: string): void => {
            this.transitions[key] = transitions[key];
        });
    }

    public addTransition(name: string, transition: any) {
        this.transitionOrder.splice(0, 0, name);
        this.transitions[name] = transition;
    }

    public removeTransition(name: string) {
        delete this.transitions[name];
        this.transitionOrder.splice(this.transitionOrder.indexOf(name), 1);
    }

    public makeTransition(name: string, nextState?: any) {
        if (name == null) {
            throw new InvalidArgumentsError('need transition name');
        }
        if (nextState === undefined) {
            nextState = this.constructor.name;
        }

        // @ts-ignore
        let pattern = this.patterns[name];
        if (!(pattern instanceof RegExp)) {
            try {
                pattern = new RegExp(`^${pattern}`);
            } catch (error) {
                throw error;
            }
        }
        // @ts-ignore
        if (typeof (this[name]) !== 'function') {
            throw new Error(`cant find method ${name} on ${this.constructor.name}`);
        }

        // @ts-ignore
        const method = this[name];

        return [pattern, method, nextState];
    }

    public makeTransitions(nameList: string[]): [string, {}][] {
        const names: any[] = [];
        const transitions: any = {};
        /* istanbul ignore if */
        if (!Array.isArray(nameList)) {
            // console.log('warning, not an array');
            throw new Error('not array');
        }

        /* check what happens with throw inside here */
        nameList.forEach((namestate: any | any[]) => {
            if (namestate == null) {
                /* istanbul ignore if */
                throw new InvalidArgumentsError('nameList contains null');
            }
            if (!Array.isArray(namestate)) {
                transitions[namestate.toString()] = this.makeTransition(namestate);
                names.push(namestate);
            } else {
                transitions[namestate[0]] = this.makeTransition(namestate[0], namestate[1]);
                names.push(namestate[0]);
            }
        });

        return [names, transitions];
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars,@typescript-eslint/no-explicit-any */
    public noMatch(context: any[], transitions: any): any[] {
        return [context, null, []];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public bof(context: any[]): any[] {
        return [context, []];
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars,@typescript-eslint/no-explicit-any */
    public eof(context: any): any[] {
        return [];
    }

    public nop(match: {}, context: {}[], nextState: {}): {}[] {
        return [context, nextState, []];
    }
}

export default State;
