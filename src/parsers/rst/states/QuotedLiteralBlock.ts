import RSTState from './RSTState';
import * as RegExps from '../RegExps';
import { escapeRegExp } from '../../../utils';
import * as nodes from '../../../nodes';
import { EOFError } from '../../../Exceptions';
import RSTStateMachine from "../RSTStateMachine";
import {RSTStateArgs} from "../types";
import {RegexpResult, ContextArray, StateInterface, ParseMethodReturnType } from "../../../types";

/**
 *  Nested parse handler for quoted (unindented) literal blocks.
 *
 * Special-purpose.  Not for inclusion in `state_classes`.
 */
class QuotedLiteralBlock extends RSTState {
    private initial_lineno?: number;
    public _init(stateMachine: RSTStateMachine, debug: boolean) {
        super._init(stateMachine, debug);
        this.patterns = {
            // eslint-disable-next-line @typescript-eslint/camelcase
            initial_quoted: `(${RegExps.nonalphanum7bit})`,
            text: '',
        };
        this.initialTransitions = ['initial_quoted', 'text'];
        this.initial_lineno = undefined;
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
    // @ts-ignore
    public blank(match, context, nextState) {
        if (context.length) {
            throw new EOFError();
        } else {
            return [context, nextState, []];
        }
    }

    // @ts-ignore
    public eof(context) {
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

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
    public indent(match: RegexpResult, context: ContextArray, nextState: StateInterface): ParseMethodReturnType {
        // assert context, ('QuotedLiteralBlock.indent: context should not '
        // 'be empty!')
        this.messages.push(
            this.reporter!.error('Unexpected indentation.', [],
                { line: this.rstStateMachine.absLineNumber() }),
        );
        this.rstStateMachine.previousLine();
        throw new EOFError();
    }

    /** Match arbitrary quote character on the first line only. */
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/camelcase
    public initial_quoted(match, context, nextState) {
        this.removeTransition('initial_quoted');
        const quote = match.result.input[0];
        const pattern = new RegExp(escapeRegExp(quote));
        // # New transition matches consistent quotes only:
        this.addTransition('quoted',
            [pattern, this.quoted.bind(this),
                this.constructor.name]);
        // eslint-disable-next-line @typescript-eslint/camelcase
        this.initial_lineno = this.rstStateMachine.absLineNumber();
        return [[match.result.input], nextState, []];
    }

    /** Match consistent quotes on subsequent lines. */
    // @ts-ignore
    public quoted(match, context, nextState) {
        context.push(match.result.input);
        return [context, nextState, []];
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
    // @ts-ignore
    public text(match, context, nextState) {
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
