import SpecializedBody from './SpecializedBody';

class OptionList extends SpecializedBody {
/*
    """Second and subsequent option_list option_list_items."""
*/
    option_marker(match, context, nextState) {
        // """Option list item."""
        let option_list_item;
        let blank_finish;
        try {
            [option_list_item, blank_finish] = this.option_list_item(match);
        } catch (error) {
            if (error instanceof MarkupError) {
                this.invalid_input();
            }
            throw error;
        }
        this.parent.add(option_list_item);
        this.blankFinish = blank_finish;
        return [[], nextState, []];
    }
}

OptionList.stateName = 'OptionList';
OptionList.constructor.stateName = 'OptionList';
export default OptionList;
