import SpecializedText from './SpecializedText';

class Definition extends SpecializedText {
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
    // @ts-ignore
    eof(context) {
        this.rstStateMachine.previousLine(2);
        return [];
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
    indent(match: any, context: any[], nextState: any) {
        const [itemNode, blankFinish] = this.definition_list_item(context);
        this.parent!.add(itemNode);
        this.blankFinish = blankFinish;
        return [[], 'DefinitionList', []];
    }
}
Definition.stateName = 'Definition';
//Definition.constructor.stateName = 'Definition';
export default Definition;
