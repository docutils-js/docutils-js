import SpecializedText from './SpecializedText';

class Definition extends SpecializedText {
    eof(context) {
        this.stateMachine.previousLine(2);
        return [];
    }

    indent(match, context, nextState) {
        const [itemNode, blankFinish] = this.definition_list_item(context);
        this.parent.add(itemNode);
        this.blankFinish = blankFinish;
        return [[], 'DefinitionList', []];
    }
}
export default Definition;
