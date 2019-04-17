import Body from './Body';
import { EOFError } from '../../../Exceptions';

class SpecializedBody extends Body {
    _init(args) {
        super._init(args);
    }

    indent() {
        this.invalid_input();
    }

    bullet() {
        this.invalid_input();
    }

    enumerator() {
        this.invalid_input();
    }

    field_marker() {
        this.invalid_input();
    }

    option_marker() {
        this.invalid_input();
    }

    doctest() {
        this.invalid_input();
    }

    line_block() {
        this.invalid_input();
    }

    grid_table_top() {
        this.invalid_input();
    }

    simple_table_top() {
        this.invalid_input();
    }

    explicit_markup() {
        this.invalid_input();
    }

    anonymous() {
        this.invalid_input();
    }

    line() {
        this.invalid_input();
    }

    text() {
        this.invalid_input();
    }

    invalid_input(match, context, nextState) {
        this.stateMachine.previousLine();
        throw new EOFError();
    }
}
export default SpecializedBody;
