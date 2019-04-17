import Body from './Body';
import { EOFError } from '../../../Exceptions';

class SpecializedBody extends Body {
    _init(args) {
        super._init(args);
    }

    /* istanbul ignore next */
    indent() {
        this.invalid_input();
    }

    /* istanbul ignore next */
    bullet() {
        this.invalid_input();
    }

    /* istanbul ignore next */
    enumerator() {
        this.invalid_input();
    }

    /* istanbul ignore next */
    field_marker() {
        this.invalid_input();
    }

    /* istanbul ignore next */
    option_marker() {
        this.invalid_input();
    }

    /* istanbul ignore next */
    doctest() {
        this.invalid_input();
    }

    /* istanbul ignore next */
    line_block() {
        this.invalid_input();
    }

    /* istanbul ignore next */
    grid_table_top() {
        this.invalid_input();
    }

    /* istanbul ignore next */
    simple_table_top() {
        this.invalid_input();
    }

    /* istanbul ignore next */
    explicit_markup() {
        this.invalid_input();
    }

    /* istanbul ignore next */
    anonymous() {
        this.invalid_input();
    }

    /* istanbul ignore next */
    line() {
        this.invalid_input();
    }

    /* istanbul ignore next */
    text() {
        this.invalid_input();
    }

    /* istanbul ignore next */
    invalid_input(match, context, nextState) {
        this.stateMachine.previousLine();
        throw new EOFError();
    }
}
SpecializedBody.stateName = 'SpecializedBody';
SpecializedBody.constructor.stateName = 'SpecializedBody';
export default SpecializedBody;
