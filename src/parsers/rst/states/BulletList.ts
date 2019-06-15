import SpecializedBody from './SpecializedBody';


class BulletList extends SpecializedBody {
    // @ts-ignore
    public bullet(match, context, nextState) {
        if (match.result.input[0] !== this.parent!.attributes.bullet) {
            // @ts-ignore
            this.invalid_input();
        }
        const [listitem, blankFinish] = this.list_item(match.result.index + match.result[0].length);
        this.parent!.add(listitem);
        this.blankFinish = blankFinish;
        return [[], nextState, []];
    }
}

BulletList.stateName = 'BulletList';
//BulletList.constructor.stateName = 'BulletList';
export default BulletList;
