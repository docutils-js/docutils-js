import SpecializedBody from './SpecializedBody';
import {RegexpResult, ContextArray, StateType, StateInterface,ParseMethodReturnType} from '../../../types';

class DefinitionList extends SpecializedBody {
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
    public text(match: RegexpResult, context: ContextArray, nextState: StateInterface): ParseMethodReturnType {
        return [[match.result.input], 'Definition', []];
    }
}
DefinitionList.stateName = 'DefinitionList';
export default DefinitionList;
