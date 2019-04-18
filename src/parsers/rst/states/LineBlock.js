import SpecializedBody from './SpecializedBody';

class LineBlock extends SpecializedBody {
    /* """Second and subsequent lines of a line_block.""" */

    blank() {
        this.invalid_input();
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    line_block(match, context, nextState) {
        // """New line of line block."""
        const lineno = this.stateMachine.absLineNumber();
        const [line, messages, blankFinish] = this.line_block_line(match, lineno);
        this.parent.add(line);
        this.parent.parent.add(messages);
        this.blankFinish = blankFinish;
        return [[], nextState, []];
    }
}
LineBlock.stateName = 'LineBlock';
LineBlock.constructor.stateName = 'LineBlock';
export default LineBlock;
