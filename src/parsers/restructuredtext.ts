import BaseParser from '../Parser';
import * as statemachine from '../StateMachine';
import RSTStateMachine from './rst/RSTStateMachine';
import StateFactory from './rst/StateFactory';

class Parser extends BaseParser {
    private inliner: any;
    private initialState: string;
    private stateMachine: RSTStateMachine;
    constructor(args) {
        super(args);
        this.configSection = 'restructuredtext parser';
        this.configSectionDependencies = ['parsers'];
        if (args.rfc2822) {
            this.initialState = 'RFC2822Body';
        } else {
            this.initialState = 'Body';
        }

        this.inliner = args.inliner;
    }

    parse(inputstring, document) {
        if (!inputstring) {
            throw new Error('need input for rst parser');
        }

        this.setupParse(inputstring, document);
//        if (!this.stateClasses) {
//            throw new Error('need classes');
//        }

        this.stateMachine = new RSTStateMachine({
            stateFactory: new StateFactory(),
            initialState: this.initialState,
            debugFn: this.debugFn,
            debug: document.reporter.debugFlag,
});
        const inputLines = statemachine.string2lines(
            inputstring, {
 tabWidth: document.settings.tabWidth,
                           convertWhitespace: true,
},
);
//      console.log(`initial state is ${this.initialState}`);
        this.stateMachine.run({ inputLines, document,
            inliner: this.inliner });
        this.finishParse();
    }

}

export default Parser;
