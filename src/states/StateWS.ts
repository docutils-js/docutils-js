import State from './State';
import StateMachineWS from "../StateMachineWS";
import {RSTStateArgs} from "../parsers/rst/types";

class StateWS extends State {
    private wsPatterns: any;
    private wsInitialTransitions: any[] = [];
    private wsStateMachine: StateMachineWS;
    constructor(stateMachine: StateMachineWS, args: any) {
        super(stateMachine, args);
        this.wsStateMachine = stateMachine;
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

    _init(stateMachine: any, args: any) {
        super._init(stateMachine, args);
        this.indentSm = undefined;
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
        this.patterns = {...this.patterns, ...this.wsPatterns};
        const [names, transitions] = this.makeTransitions(this.wsInitialTransitions);
        this.addTransitions(names, transitions);
    }

    blank(match: any, context: any[], nextState: any) {
        return this.nop(match, context, nextState);
    }

    indent(match: any, context: any[], nextState: any) {
        /* eslint-disable-next-line no-unused-vars */
        const [indented, indent, lineOffset, blankFinish] = this.wsStateMachine.getIndented({});
        const IndentSm = this.indentSm;
        // console.log('instantiating indentsm');
        // console.log(this.indentSmKwargs);
        // @ts-ignore
        const sm = new IndentSm({ debug: this.debug, ...this.indentSmKwargs });
        if (!sm.run) {
            // console.log(Object.keys(sm));
            throw Error(`no sm run ${this} ${IndentSm!.constructor.name}`);
        }

        const results = sm.run({ inputLines: indented, inputOffset: lineOffset });
        return [context, nextState, results];
    }

    /* eslint-disable-next-line no-unused-vars */
    knownIndent(match: any, context: any[], nextState: any) {
        /* eslint-disable-next-line no-unused-vars */
        const [indented, lineOffset, blankFinish] = this.wsStateMachine.getKnownIndented(
            match.end(),
);
        const knownIndentSm = this.knownIndentSm;
        const sm = new knownIndentSm({
 debug: this.debug,
                                       ...this.knownIndentSmKwargs,
});
        const results = sm.run({ indented, inputOffset: lineOffset });
        return [context, nextState, results];
    }

    /* eslint-disable-next-line no-unused-vars */
    firstKnownIndent(match: any, context: any[], nextState: any) {
        /* eslint-disable-next-line no-unused-vars */
        const [indented, lineOffset, blankFinish] = this.wsStateMachine.getFirstKnownIndented(
            {
                indent: match.result.index + match.result[0].length,
            },
        );
        const KnownIndentSm = this.knownIndentSm;
        const sm = new KnownIndentSm({ debug: this.debug, ...this.knownIndentSmKwargs });
        const results = sm.run({ indented, inputOffset: lineOffset });
        return [context, nextState, results];
    }
}

export default StateWS;
