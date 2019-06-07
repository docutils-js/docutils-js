import {InvalidArgumentsError} from '../Exceptions';
import UnknownTransitionError from '../UnknownTransitionError';
import DuplicateTransitionError from '../DuplicateTransitionError';
import {IReporter, IState, IStateMachine} from "../types";
import {StateMachine} from "../StateMachine";
import StateMachineWS from "../StateMachineWS";
import {RSTStateArgs} from "../parsers/rst/states/RSTState";

class State implements IState {
    protected knownIndentSm: any;
    protected debug: boolean;
    protected knownIndentSmKwargs: any;
    protected indentSmKwargs: any;
    protected patterns: any;

    protected indentSm?: StateMachine;
    protected nestedSmKwargs: any;
    protected transitionOrder: string[];
    protected transitions: any;
    protected initialTransitions?: string[] | string[][];
    protected nestedSm: any;
    protected reporter?: IReporter;
    private stateMachine?: StateMachine;

    constructor(stateMachine: StateMachine, args: { debug?: boolean}) {
        this.stateMachine = stateMachine;
        this.debug = args.debug!;
        this._init(stateMachine, args);
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

    // eslint-disable-next-line no-unused-vars
    _init(stateMachine: StateMachine, args: RSTStateArgs) {
            /* empty */
        this.patterns = {};
        this.initialTransitions = undefined;
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
            this.addTransitions(names as any[], transitions);
        }
    }

    addTransitions(names: any[], transitions: any) {
        names.forEach(((name) => {
            if (name in this.transitions) {
                throw new DuplicateTransitionError(name);
            }
            if (!(name in transitions)) {
                throw new UnknownTransitionError(name);
            }
        }));
        this.transitionOrder.splice(0, 0, ...names);
        Object.keys(transitions).forEach((key: string) => {
            this.transitions[key] = transitions[key];
        });
    }

    addTransition(name: any, transition: any) {
        this.transitionOrder.splice(0, 0, name);
        this.transitions[name] = transition;
    }

    removeTransition(name: string) {
        delete this.transitions[name];
        this.transitionOrder.splice(this.transitionOrder.indexOf(name), 1);
    }

    makeTransition(name: string, nextState?: any) {
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
        // @ts-ignore
        if (typeof (this[name]) !== 'function') {
            throw new Error(`cant find method ${name} on ${this.constructor.name}`);
        }

        // @ts-ignore
        const method = this[name];

        return [pattern, method, nextState];
    }

    makeTransitions(nameList: any[]) {
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

    /* eslint-disable-next-line no-unused-vars */
    noMatch(context: any[], transitions: any): any[] {
        return [context, null, []];
    }

    bof(context: any[]): any[] {
        return [context, []];
    }

    /* eslint-disable-next-line no-unused-vars */
    eof(context: any): any[] {
        return [];
    }

    nop(match: any, context: any[], nextState: any): any[] {
        return [context, nextState, []];
    }
}

export default State;
