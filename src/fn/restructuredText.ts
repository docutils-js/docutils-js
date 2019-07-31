import * as statemachine from '../StateMachine';
import RSTStateMachine from '../parsers/rst/RSTStateMachine';
import StateFactory from '../parsers/rst/StateFactory';
import {Document, LoggerType} from "../types";

/**
 *
 * @param inputstring
 * @param document
 */

function parse(inputstring: string, document: Document, logger: LoggerType): Document {
    const initialState = 'Body';
    const stateMachine = new RSTStateMachine({
        stateFactory: new StateFactory({logger}),
        initialState,
        /*        debugFn: this.debugFn,
        debug: document.reporter.debugFlag, */ // fixme
        logger,
    });
    let tabWidth;
    if(document.settings !== undefined) {
        tabWidth = document.settings.tabWidth;
    }
    const inputLines = statemachine.string2lines(
        inputstring, {
            tabWidth,
            convertWhitespace: true,
        },
    );
    stateMachine.run(inputLines, 0, undefined, undefined, undefined, document);
    
    return document;
}
export default parse;
