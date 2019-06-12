import * as statemachine from '../StateMachine';
import RSTStateMachine from '../parsers/rst/RSTStateMachine';
import StateFactory from '../parsers/rst/StateFactory';
import {Document} from "../types";

/**
 *
 * @param inputstring
 * @param document
 */

function parse(inputstring: string, document: Document) {
    const initialState = 'Body';
    const stateMachine = new RSTStateMachine({
        stateFactory: new StateFactory(),
        initialState,
        /*        debugFn: this.debugFn,
        debug: document.reporter.debugFlag, */ // fixme
    });
    const inputLines = statemachine.string2lines(
        inputstring, {
            tabWidth: document.settings.docutilsParsersRstParser!.tabWidth,
            convertWhitespace: true,
        },
    );
    stateMachine.run({
        inputLines, document,
        /* inliner: this.inliner */ });
    return document;
}
export default parse;
