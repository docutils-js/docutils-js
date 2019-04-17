class State {
    constructor(stateMachine, debug = false) {
        this.transitionOrder = [];
        this.transitions = {};
        this.addInitialTransitions();
        this.stateMachine = stateMachine;
        this.debug = debug;
        if (this.nestedSm === undefined) {
            this.nestedSm = type(this.stateMachine);
        }
        // if self.nested_sm_kwargs is None:
        // self.nested_sm_kwargs = {'state_classes': [self.__class__],
        // 'initial_state': self.__class__.__name__}
    }

    runtimeInit() {
    }

    unlink() {
        this.stateMachine = undefined;
    }

    addInitialTransitions() {
        if (this.initialTransitions) {
            [names, transitions] = this.makeTransitions(self.initialTransitions);
            this.addTransitions(names, transitions);
        }
    }

    addTransitions(names, transitions) {
        names.forEach((name) => {
            if (this.transitions.includes(name)) {
                throw new DuplicateTransitionError(name);
            }
            if (!transitions.includes(name)) {
                throw new UnknownTransitionError(name);
            }
        });
        this.transitionOrder.splice(0, 0, names);
        this.transitions.update(transitions);
    }
}

export default State;
