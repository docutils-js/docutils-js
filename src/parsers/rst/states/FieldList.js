import SpecializedBody from './SpecializedBody';

class FieldList extends SpecializedBody {
/*    """Second and subsequent field_list fields.""" */

    /* eslint-disable-next-line camelcase */
    field_marker(match, context, nextState) {
        /* """Field list field.""" */
        const [field, blankFinish] = this.field(match);
        this.parent.add(field);
        this.blankFinish = blankFinish;
        return [[], nextState, []];
    }
}
FieldList.stateName = 'FieldList';
FieldList.constructor.stateName = 'FieldList';
export default FieldList;
