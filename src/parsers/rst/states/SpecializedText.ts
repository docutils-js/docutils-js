import Text from './Text';
import { EOFError } from '../../../Exceptions';
import State from "../../../states/State";
import RSTStateMachine from "../RSTStateMachine";
import {RSTStateArgs} from "../types";
import {RegexpResult, ContextArray, StateInterface, ParseMethodReturnType } from "../../../types";

class SpecializedText extends Text {

    /* istanbul ignore next */
    // @ts-ignore
    blank() {
        this.invalidInput();
    }

    /* istanbul ignore next */
    // @ts-ignore
    underline() {
        this.invalidInput();
    }

    /* istanbul ignore next */
    public indent(match: RegexpResult, context: ContextArray, nextState: StateInterface): ParseMethodReturnType {
        this.invalidInput();
        // @ts-ignore
        return [];
    }

    /* istanbul ignore next */
    public text(match: RegexpResult, context: ContextArray, nextState: StateInterface): ParseMethodReturnType {
        this.invalidInput();
        // @ts-ignore
        return [];
    }

    /* istanbul ignore next */
    eof() {
        return [];
    }

    /* istanbul ignore next */
    public invalidInput(): never {
        throw new EOFError();
    }
}

SpecializedText.stateName = 'SpecializedText';
//SpecializedText.constructor.stateName = 'SpecializedText';
export default SpecializedText;
