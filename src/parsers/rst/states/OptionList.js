import SpecializedBody from './SpecializedBody';

class OptionList extends SpecializedBody {
/*
    """Second and subsequent option_list option_list_items."""
*/
    /* eslint-disable-next-line */
    option_marker(match, context, nextState) {
        // """Option list item."""
        let optionListItem;
        let blankFinish;
        try {
            [optionListItem, blankFinish] = this.option_list_item(match);
        } catch (error) {
            if (error instanceof MarkupError) {
                this.invalid_input();
            }
            throw error;
        }
        this.parent.add(optionListItem);
        this.blankFinish = blankFinish;
        return [[], nextState, []];
    }
}

OptionList.stateName = 'OptionList';
OptionList.constructor.stateName = 'OptionList';
export default OptionList;
