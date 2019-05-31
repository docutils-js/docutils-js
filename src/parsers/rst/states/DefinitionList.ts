import SpecializedBody from './SpecializedBody';

class DefinitionList extends SpecializedBody {
    /* eslint-disable-next-line no-unused-vars */
    text(match, context, nextState) {
        return [[match.result.input], 'Definition', []];
    }
}
DefinitionList.stateName = 'DefinitionList';
DefinitionList.constructor.stateName = 'DefinitionList';
export default DefinitionList;
