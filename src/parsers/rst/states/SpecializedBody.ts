import Body from './Body';
import { EOFError } from '../../../Exceptions';
import RSTStateMachine from "../RSTStateMachine";
import {RSTStateArgs} from "../types";
import {
RegexpResult,
ContextArray,
StateType,
StateInterface,
ParseMethodReturnType,
Patterns,
} from '../../../types';
class SpecializedBody extends Body {

    /* istanbul ignore next */
    // @ts-ignore
    public indent(match: RegexpResult, context: ContextArray, nextState: StateInterface): ParseMethodReturnType {
        // @ts-ignore
        this.invalid_input();
    }

    /* istanbul ignore next */
    // @ts-ignore
    public bullet(match: RegexpResult, context: ContextArray, nextState: StateInterface): ParseMethodReturnType {
        // @ts-ignore
        this.invalid_input();
    }

    /* istanbul ignore next */
    // @ts-ignore
    public (match: RegexpResult, context: ContextArray, nextState: StateInterface): ParseMethodReturnType {
        // @ts-ignore
        this.invalid_input();
    }

    /* istanbul ignore next */
    /* eslint-disable-next-line @typescript-eslint/camelcase,camelcase,@typescript-eslint/no-unused-vars,no-unused-vars */
    // @ts-ignore
    public field_marker(match: RegexpResult, context: ContextArray, nextState: StateInterface): ParseMethodReturnType {
        // @ts-ignore
        this.invalid_input();
    }

    /* istanbul ignore next */
    /* eslint-disable-next-line @typescript-eslint/camelcase,camelcase,@typescript-eslint/no-unused-vars,no-unused-vars */
    // @ts-ignore
    public option_marker(match: RegexpResult, context: ContextArray, nextState: StateInterface): ParseMethodReturnType {
        // @ts-ignore
        this.invalid_input();
    }

    /* istanbul ignore next */
    // @ts-ignore
    public doctest(match: RegexpResult, context: ContextArray, nextState: StateInterface): ParseMethodReturnType {
        // @ts-ignore
        this.invalid_input();
    }

    /* istanbul ignore next */
    /* eslint-disable-next-line @typescript-eslint/camelcase,camelcase,@typescript-eslint/no-unused-vars,no-unused-vars */
    // @ts-ignore
    public line_block(match: RegexpResult, context: ContextArray, nextState: StateInterface): ParseMethodReturnType {
        // @ts-ignore
        this.invalid_input();
    }

    /* istanbul ignore next */
    /* eslint-disable-next-line @typescript-eslint/camelcase,camelcase,@typescript-eslint/no-unused-vars,no-unused-vars */
    // @ts-ignore
    public grid_table_top(match: RegexpResult, context: ContextArray, nextState: StateInterface): ParseMethodReturnType {
        // @ts-ignore
        this.invalid_input();
    }

    /* istanbul ignore next */
    /* eslint-disable-next-line @typescript-eslint/camelcase,camelcase,@typescript-eslint/no-unused-vars,no-unused-vars */
    // @ts-ignore
    public simple_table_top(match: RegexpResult, context: ContextArray, nextState: StateInterface): ParseMethodReturnType {
        // @ts-ignore
        this.invalid_input();
    }

    /* istanbul ignore next */
    /* eslint-disable-next-line @typescript-eslint/camelcase,camelcase,@typescript-eslint/no-unused-vars,no-unused-vars */
    // @ts-ignore
    public explicit_markup(match: RegexpResult, context: ContextArray, nextState: StateInterface): ParseMethodReturnType {
        // @ts-ignore
        this.invalid_input();
    }

    /* istanbul ignore next */
    // @ts-ignore
    public anonymous(match: RegexpResult, context: ContextArray, nextState: StateInterface): ParseMethodReturnType {
        // @ts-ignore
        this.invalid_input();
    }

    /* istanbul ignore next */
    // @ts-ignore
    public line(match: RegexpResult, context: ContextArray, nextState: StateInterface): ParseMethodReturnType {
        // @ts-ignore
        this.invalid_input();
    }

    /* istanbul ignore next */
    // @ts-ignore
    public text(match: RegexpResult, context: ContextArray, nextState: StateInterface): ParseMethodReturnType {
        // @ts-ignore
        this.invalid_input();
    }

    /* istanbul ignore next */
    /* eslint-disable-next-line @typescript-eslint/camelcase,camelcase,@typescript-eslint/no-unused-vars,no-unused-vars */
    public invalid_input(match: RegexpResult, context: ContextArray, nextState: StateInterface): ParseMethodReturnType {
        this.rstStateMachine.previousLine();
        throw new EOFError();
    }
}
SpecializedBody.stateName = 'SpecializedBody';
//SpecializedBody.constructor.stateName = 'SpecializedBody';
export default SpecializedBody;
