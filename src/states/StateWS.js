import State from './State';

class StateWS extends State {
    constructor(args) {
        super(args);
        /* istanbul ignore else */
        if (!this.indentSm) {
            this.indentSm = this.nestedSm;
        }
        /* istanbul ignore else */
        if (!this.indentSmKwargs) {
            this.indentSmKwargs = this.nestedSmKwargs;
        }
        /* istanbul ignore else */
        if (!this.knownIndentSm) {
            this.knownIndentSm = this.indentSm;
        }
        /* istanbul ignore else */
        if (!this.knownIndentSmKwargs) {
            this.knownIndentSmKwargs = this.indentSmKwargs;
        }
    }

    _init(...args) {
        super._init(...args);
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
        // console.log('instantiating indentsm');
        // console.log(this.indentSmKwargs);
        const sm = new IndentSm({ debug: this.debug, ...this.indentSmKwargs });
        if (!sm.run) {
            // console.log(Object.keys(sm));
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

export default StateWS;
