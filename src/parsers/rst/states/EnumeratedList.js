import SpecializedBody from './SpecializedBody';

class EnumeratedList extends SpecializedBody {
    /* """Second and subsequent enumerated_list list_items.""" */
    enumerator(match, context, nextState) {
        /* """Enumerated list item.""" */
        /* eslint-disable-next-line no-unused-vars */
        const [format, sequence, text, ordinal] = this.parse_enumerator(
            match, this.parent.attributes.enumtype,
);
        if ((format !== this.format
              || (sequence !== '#' && (sequence !== this.parent.attributes.enumtype
                                       || this.auto// fxme
                                       || ordinal !== (this.lastordinal + 1)))
              || !this.is_enumerated_list_item(ordinal, sequence, format))) {
            // # different enumeration: new list
            this.invalid_input();
        }
        if (sequence === '#') {
            this.auto = 1;
        }
        const [listitem, blank_finish] = this.list_item(
            match.result.index + match.result[0].length,
);
        this.parent.add(listitem);
        this.blankFinish = blank_finish;
        this.lastordinal = ordinal;
        return [[], nextState, []];
    }
}
EnumeratedList.stateName = 'EnumeratedList';
EnumeratedList.constructor.stateName = 'EnumeratedList';
export default EnumeratedList;
