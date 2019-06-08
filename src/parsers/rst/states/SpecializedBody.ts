import Body from './Body';
import { EOFError } from '../../../Exceptions';
import RSTStateMachine from "../RSTStateMachine";
import {RSTStateArgs} from "../types";

class SpecializedBody extends Body {
    _init(stateMachine: RSTStateMachine, args: RSTStateArgs) {
        super._init(stateMachine, args);
    }

    /* istanbul ignore next */
    // @ts-ignore
    indent() {
        // @ts-ignore
        this.invalid_input();
    }

    /* istanbul ignore next */
    // @ts-ignore
    bullet() {
        // @ts-ignore
        this.invalid_input();
    }

    /* istanbul ignore next */
    // @ts-ignore
    enumerator() {
        // @ts-ignore
        this.invalid_input();
    }

    /* istanbul ignore next */
    /* eslint-disable-next-line camelcase,no-unused-vars */
    // @ts-ignore
    field_marker() {
        // @ts-ignore
        this.invalid_input();
    }

    /* istanbul ignore next */
    /* eslint-disable-next-line camelcase,no-unused-vars */
    // @ts-ignore
    option_marker() {
        // @ts-ignore
        this.invalid_input();
    }

    /* istanbul ignore next */
    // @ts-ignore
    doctest() {
        // @ts-ignore
        this.invalid_input();
    }

    /* istanbul ignore next */
    /* eslint-disable-next-line camelcase,no-unused-vars */
    // @ts-ignore
    line_block() {
        // @ts-ignore
        this.invalid_input();
    }

    /* istanbul ignore next */
    /* eslint-disable-next-line camelcase,no-unused-vars */
    // @ts-ignore
    grid_table_top() {
        // @ts-ignore
        this.invalid_input();
    }

    /* istanbul ignore next */
    /* eslint-disable-next-line camelcase,no-unused-vars */
    // @ts-ignore
    simple_table_top() {
        // @ts-ignore
        this.invalid_input();
    }

    /* istanbul ignore next */
    /* eslint-disable-next-line camelcase,no-unused-vars */
    // @ts-ignore
    explicit_markup() {
        // @ts-ignore
        this.invalid_input();
    }

    /* istanbul ignore next */
    // @ts-ignore
    anonymous() {
        // @ts-ignore
        this.invalid_input();
    }

    /* istanbul ignore next */
    // @ts-ignore
    line() {
        // @ts-ignore
        this.invalid_input();
    }

    /* istanbul ignore next */
    // @ts-ignore
    text() {
        // @ts-ignore
        this.invalid_input();
    }

    /* istanbul ignore next */
    /* eslint-disable-next-line camelcase,no-unused-vars */
    invalid_input(match: any, context: any[], nextState: any): any[] {
        this.rstStateMachine.previousLine();
        throw new EOFError();
    }
}
SpecializedBody.stateName = 'SpecializedBody';
//SpecializedBody.constructor.stateName = 'SpecializedBody';
export default SpecializedBody;
