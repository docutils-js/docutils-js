import SpecializedBody from './SpecializedBody';
import {RegexpResult, ContextArray, StateType, StateInterface,ParseMethodReturnType} from '../../../types';


class BulletList extends SpecializedBody {
    public bullet(match: RegexpResult, context: ContextArray, nextState: StateInterface): ParseMethodReturnType {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if (match.result.input[0] !== this.parent!.attributes.bullet) {
            // @ts-ignore
            this.invalid_input();
        }
        const [listitem, blankFinish] = this.list_item(match.result.index + match.result[0].length);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.parent!.add(listitem);
        this.blankFinish = blankFinish;
        return [[], nextState, []];
    }
}

BulletList.stateName = 'BulletList';
export default BulletList;
