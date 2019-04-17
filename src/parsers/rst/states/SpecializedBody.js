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
    /* eslint-disable-next-line camelcase,no-unused-vars */
    field_marker() {
        this.invalid_input();
    }

    /* istanbul ignore next */
    /* eslint-disable-next-line camelcase,no-unused-vars */
    option_marker() {
        this.invalid_input();
    }

    /* istanbul ignore next */
    doctest() {
        this.invalid_input();
    }

    /* istanbul ignore next */
    /* eslint-disable-next-line camelcase,no-unused-vars */
    line_block() {
        this.invalid_input();
    }

    /* istanbul ignore next */
    /* eslint-disable-next-line camelcase,no-unused-vars */
    grid_table_top() {
        this.invalid_input();
    }

    /* istanbul ignore next */
    /* eslint-disable-next-line camelcase,no-unused-vars */
    simple_table_top() {
        this.invalid_input();
    }

    /* istanbul ignore next */
    /* eslint-disable-next-line camelcase,no-unused-vars */
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
    /* eslint-disable-next-line camelcase,no-unused-vars */
    invalid_input(match, context, nextState) {
        this.stateMachine.previousLine();
        throw new EOFError();
    }
}
SpecializedBody.stateName = 'SpecializedBody';
SpecializedBody.constructor.stateName = 'SpecializedBody';
export default SpecializedBody;
