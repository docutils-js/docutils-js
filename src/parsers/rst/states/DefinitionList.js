import SpecializedBody from './SpecializedBody';

class DefinitionList extends SpecializedBody {
    text(match, context, nextState) {
        return [[match.result.input], 'Definition', []];
    }
}
DefinitionList.stateName = 'DefinitionList';
DefinitionList.constructor.stateName = 'DefinitionList';
export default DefinitionList;
