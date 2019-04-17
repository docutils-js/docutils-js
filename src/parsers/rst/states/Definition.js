import SpecializedText from './SpecializedText';

class Definition extends SpecializedText {
    /* eslint-disable-next-line no-unused-vars */
    eof(context) {
        this.stateMachine.previousLine(2);
        return [];
    }

    /* eslint-disable-next-line no-unused-vars */
    indent(match, context, nextState) {
        const [itemNode, blankFinish] = this.definition_list_item(context);
        this.parent.add(itemNode);
        this.blankFinish = blankFinish;
        return [[], 'DefinitionList', []];
    }
}
Definition.stateName = 'Definition';
Definition.constructor.stateName = 'Definition';
export default Definition;
