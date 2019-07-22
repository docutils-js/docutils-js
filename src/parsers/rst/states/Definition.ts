import SpecializedText from './SpecializedText';
import {RegexpResult, ContextArray, StateType, StateInterface,ParseMethodReturnType} from '../../../types';
class Definition extends SpecializedText {
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars
    public eof(context): ContextArray {
        this.rstStateMachine.previousLine(2);
        return [];
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
    public indent(match: RegexpResult, context: ContextArray, nextState: StateInterface): ParseMethodReturnType {
        /* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
        const [itemNode, blankFinish] = this.definition_list_item(context);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.parent!.add(itemNode);
        this.blankFinish = blankFinish;
        return [[], 'DefinitionList', []];
    }
}
Definition.stateName = 'Definition';
export default Definition;
