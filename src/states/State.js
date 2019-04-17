class State {
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
        this.transitionOrder.splice(0, 0, name);
        this.transitions[name] = transition;
    }

    removeTransition(name) {
        delete this.transitions[name];
        this.transitionOrder.splice(this.transitionOrder.indexOf(name), 1);
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

export default State;
