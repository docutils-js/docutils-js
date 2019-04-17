import SpecializedBody from './SpecializedBody';

class LineBlock extends SpecializedBody {
    /* """Second and subsequent lines of a line_block.""" */

    blank() {
        this.invalid_input();
    }

    line_block(match, context, next_state) {
        // """New line of line block."""
        const lineno = this.stateMachine.absLineNumber();
        const [line, messages, blank_finish] = this.line_block_line(match, lineno);
        this.parent.add(line);
        this.parent.parent.add(messages);
        this.blankFinish = blank_finish;
        return [[], next_state, []];
    }
}
export default LineBlock;
