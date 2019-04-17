import SpecializedBody from './SpecializedBody';

class FieldList extends SpecializedBody {
/*    """Second and subsequent field_list fields.""" */

    field_marker(match, context, next_state) {
        /* """Field list field.""" */
        const [field, blank_finish] = this.field(match);
        this.parent.add(field);
        this.blankFinish = blank_finish;
        return [[], next_state, []];
    }
}
export default FieldList;
