import RSTState from './RSTState';
import * as RegExps from '../RegExps';
import { escapeRegExp } from '../../../utils';
import * as nodes from '../../../nodes';
import { EOFError } from '../../../Exceptions';

class QuotedLiteralBlock extends RSTState {
/*
    """
    Nested parse handler for quoted (unindented) literal blocks.

    Special-purpose.  Not for inclusion in `state_classes`.
    """
*/
    _init() {
        super._init();
        this.patterns = {
 initial_quoted: `(${RegExps.nonalphanum7bit})`,
                text: '',
};
        this.initialTransitions = ['initial_quoted', 'text'];
        this.messages = [];
        this.initial_lineno = null;
    }

    blank(match, context, next_state) {
        if (context.length) {
            throw new EOFError();
        } else {
            return [context, next_state, []];
        }
    }

    eof(context) {
        if (context.length) {
            const [src, srcline] = this.stateMachine.getSourceAndLine(
                this.initial_lineno,
);
            const text = context.join('\n');
            const literal_block = new nodes.literal_block(text, text);
            literal_block.source = src;
            literal_block.line = srcline;
            this.parent.add(literal_block);
        } else {
            this.parent.add(this.reporter.warning(
                'Literal block expected; none found.', [],
                { line: this.stateMachine.absLineNumber() },
));
            // # src not available, because statemachine.input_lines is empty
            this.stateMachine.previousLine();
        }
        this.parent.add(this.messages);
        return [];
    }

    indent(match, context, next_state) {
//        assert context, ('QuotedLiteralBlock.indent: context should not '
//                         'be empty!')
        this.messages.push(
            this.reporter.error('Unexpected indentation.', [],
                                { line: this.stateMachine.absLineNumber() }),
);
        this.stateMachine.previousLine();
        throw new EOFError();
    }

    initial_quoted(match, context, next_state) {
        // """Match arbitrary quote character on the first line only."""
        this.removeTransition('initial_quoted');
        const quote = match.result.input[0];
        const pattern = new RegExp(escapeRegExp(quote));
        // # New transition matches consistent quotes only:
        this.addTransition('quoted',
                           [pattern, this.quoted.bind(this),
                            this.constructor.name]);
        this.initial_lineno = this.stateMachine.absLineNumber();
        return [[match.result.input], next_state, []];
    }

    quoted(match, context, next_state) {
        // """Match consistent quotes on subsequent lines."""
        context.push(match.result.input);
        return [context, next_state, []];
    }

    text(match, context, next_state) {
        if (context.length) {
            this.messages.push(
                this.reporter.error('Inconsistent literal block quoting.',
                                    [], { line: this.stateMachine.absLineNumber() }),
);
            this.stateMachine.previousLine();
        }
        throw new EOFError();
    }
}
QuotedLiteralBlock.stateName = 'QuotedLiteralBlock';
QuotedLiteralBlock.constructor.stateName = 'QuotedLiteralBlock';
export default QuotedLiteralBlock;
