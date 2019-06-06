import * as statemachine from '../StateMachine';
import RSTStateMachine from '../parsers/rst/RSTStateMachine';
import StateFactory from '../parsers/rst/StateFactory';

function parse(inputstring, document) {
    const initialState = 'Body';
    const stateMachine = new RSTStateMachine({
        stateFactory: new StateFactory(),
        initialState,
/*        debugFn: this.debugFn,
        debug: document.reporter.debugFlag, */ // fixme
    });
            const inputLines = statemachine.string2lines(
            inputstring, {
 tabWidth: document.settings.tabWidth,
                           convertWhitespace: true,
},
);
    stateMachine.run({
 inputLines, document,
                            /* inliner: this.inliner */ });
    return document;
}
export default parse;
