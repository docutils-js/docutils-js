import Body from './Body';
import { EOFError } from '../../../Exceptions';
import RSTStateMachine from "../RSTStateMachine";
import {RSTStateArgs} from "../types";

class SpecializedBody extends Body {

    /* istanbul ignore next */
    // @ts-ignore
    public indent() {
        // @ts-ignore
        this.invalid_input();
    }

    /* istanbul ignore next */
    // @ts-ignore
    public bullet() {
        // @ts-ignore
        this.invalid_input();
    }

    /* istanbul ignore next */
    // @ts-ignore
    public enumerator() {
        // @ts-ignore
        this.invalid_input();
    }

    /* istanbul ignore next */
    /* eslint-disable-next-line @typescript-eslint/camelcase,camelcase,@typescript-eslint/no-unused-vars,no-unused-vars */
    // @ts-ignore
    public field_marker() {
        // @ts-ignore
        this.invalid_input();
    }

    /* istanbul ignore next */
    /* eslint-disable-next-line @typescript-eslint/camelcase,camelcase,@typescript-eslint/no-unused-vars,no-unused-vars */
    // @ts-ignore
    public option_marker() {
        // @ts-ignore
        this.invalid_input();
    }

    /* istanbul ignore next */
    // @ts-ignore
    public doctest() {
        // @ts-ignore
        this.invalid_input();
    }

    /* istanbul ignore next */
    /* eslint-disable-next-line @typescript-eslint/camelcase,camelcase,@typescript-eslint/no-unused-vars,no-unused-vars */
    // @ts-ignore
    public line_block() {
        // @ts-ignore
        this.invalid_input();
    }

    /* istanbul ignore next */
    /* eslint-disable-next-line @typescript-eslint/camelcase,camelcase,@typescript-eslint/no-unused-vars,no-unused-vars */
    // @ts-ignore
    public grid_table_top() {
        // @ts-ignore
        this.invalid_input();
    }

    /* istanbul ignore next */
    /* eslint-disable-next-line @typescript-eslint/camelcase,camelcase,@typescript-eslint/no-unused-vars,no-unused-vars */
    // @ts-ignore
    public simple_table_top() {
        // @ts-ignore
        this.invalid_input();
    }

    /* istanbul ignore next */
    /* eslint-disable-next-line @typescript-eslint/camelcase,camelcase,@typescript-eslint/no-unused-vars,no-unused-vars */
    // @ts-ignore
    public explicit_markup() {
        // @ts-ignore
        this.invalid_input();
    }

    /* istanbul ignore next */
    // @ts-ignore
    public anonymous() {
        // @ts-ignore
        this.invalid_input();
    }

    /* istanbul ignore next */
    // @ts-ignore
    public line() {
        // @ts-ignore
        this.invalid_input();
    }

    /* istanbul ignore next */
    // @ts-ignore
    public text() {
        // @ts-ignore
        this.invalid_input();
    }

    /* istanbul ignore next */
    /* eslint-disable-next-line @typescript-eslint/camelcase,camelcase,@typescript-eslint/no-unused-vars,no-unused-vars */
    public invalid_input(match: any, context: any[], nextState: any): any[] {
        this.rstStateMachine.previousLine();
        throw new EOFError();
    }
}
SpecializedBody.stateName = 'SpecializedBody';
//SpecializedBody.constructor.stateName = 'SpecializedBody';
export default SpecializedBody;
