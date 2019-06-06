import SpecializedBody from './SpecializedBody';

/** Second and subsequent field_list fields. */
class FieldList extends SpecializedBody {
    /** Field list field. */
    /* eslint-disable-next-line camelcase */
    // @ts-ignore
    field_marker(match, context, nextState) {
        const [field, blankFinish] = this.field(match);
        this.parent.add(field);
        this.blankFinish = blankFinish;
        return [[], nextState, []];
    }
}
//FieldList.stateName = 'FieldList';
//FieldList.constructor.stateName = 'FieldList';
export default FieldList;
