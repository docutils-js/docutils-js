import SpecializedBody from './SpecializedBody';

class DefinitionList extends SpecializedBody {
    text(match, context, nextState) {
        return [[match.result.input], 'Definition', []];
    }
}
export default DefinitionList;
