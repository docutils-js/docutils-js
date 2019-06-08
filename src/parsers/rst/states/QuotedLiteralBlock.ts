import RSTState from './RSTState';
import * as RegExps from '../RegExps';
import { escapeRegExp } from '../../../utils';
import * as nodes from '../../../nodes';
import { EOFError } from '../../../Exceptions';
import RSTStateMachine from "../RSTStateMachine";
import {RSTStateArgs} from "../types";

/**
    Nested parse handler for quoted (unindented) literal blocks.

    Special-purpose.  Not for inclusion in `state_classes`.
*/
class QuotedLiteralBlock extends RSTState {
    private initial_lineno?: number;
    _init(stateMachine: RSTStateMachine, args: RSTStateArgs) {
        super._init(stateMachine, args);
        this.patterns = {
 initial_quoted: `(${RegExps.nonalphanum7bit})`,
                text: '',
};
        this.initialTransitions = ['initial_quoted', 'text'];
        this.initial_lineno = undefined;
    }

    /* eslint-disable-next-line no-unused-vars */
    // @ts-ignore
    blank(match, context, nextState) {
        if (context.length) {
            throw new EOFError();
        } else {
            return [context, nextState, []];
        }
    }

    // @ts-ignore
    eof(context) {
        if (context.length) {
            const [src, srcline] = this.rstStateMachine.getSourceAndLine(
                this.initial_lineno,
);
            const text = context.join('\n');
            const literalBlock = new nodes.literal_block(text, text);
            literalBlock.source = src;
            literalBlock.line = srcline;
            this.parent!.add(literalBlock);
        } else {
            this.parent!.add(this.reporter!.warning(
                'Literal block expected; none found.', [],
                { line: this.rstStateMachine.absLineNumber() },
));
            // # src not available, because statemachine.input_lines is empty
            this.rstStateMachine.previousLine();
        }
        this.parent!.add(this.messages);
        return [];
    }

    /* eslint-disable-next-line no-unused-vars */
    indent(match: any, context: any[], nextState: any): any[] {
//        assert context, ('QuotedLiteralBlock.indent: context should not '
//                         'be empty!')
        this.messages.push(
            this.reporter!.error('Unexpected indentation.', [],
                                { line: this.rstStateMachine.absLineNumber() }),
);
        this.rstStateMachine.previousLine();
        throw new EOFError();
    }

    /** Match arbitrary quote character on the first line only. */
    /* eslint-disable-next-line camelcase */
    // @ts-ignore
    initial_quoted(match, context, nextState) {
        this.removeTransition('initial_quoted');
        const quote = match.result.input[0];
        const pattern = new RegExp(escapeRegExp(quote));
        // # New transition matches consistent quotes only:
        this.addTransition('quoted',
                           [pattern, this.quoted.bind(this),
                            this.constructor.name]);
        this.initial_lineno = this.rstStateMachine.absLineNumber();
        return [[match.result.input], nextState, []];
    }

    /** Match consistent quotes on subsequent lines. */
    // @ts-ignore
    quoted(match, context, nextState) {
        context.push(match.result.input);
        return [context, nextState, []];
    }

    /* eslint-disable-next-line no-unused-vars */
    // @ts-ignore
    text(match, context, nextState) {
        if (context.length) {
            this.messages.push(
                this.reporter!.error('Inconsistent literal block quoting.',
                                    [], { line: this.rstStateMachine.absLineNumber() }),
);
            this.rstStateMachine.previousLine();
        }
        throw new EOFError();
    }
}
QuotedLiteralBlock.stateName = 'QuotedLiteralBlock';
//QuotedLiteralBlock.constructor.stateName = 'QuotedLiteralBlock';
export default QuotedLiteralBlock;
