import SpecializedBody from './SpecializedBody';
import MarkupError from '../MarkupError';

class Explicit extends SpecializedBody {
    /*
    """Second and subsequent explicit markup construct."""
    */
    explicit_markup(match, context, next_state) {
        // """Footnotes, hyperlink targets, directives, comments."""
        const [nodelist, blank_finish] = this.explicit_construct(match);
        this.parent.add(nodelist);
        this.blankFinish = blank_finish;
        return [[], next_state, []];
    }

    explicit_construct(match) {
        // """Determine which explicit construct this is, parse & return it."""
        const errors = [];
        for (const [method, pattern] of this.explicit.constructs) {
            const expmatch = pattern.exec(match.result.input);
            if (expmatch) {
                try {
                    const r = method(expmatch);
//                  console.log(r);
                    return r;
                } catch (error) {
                    if (error instanceof MarkupError) {
                        const lineno = this.stateMachine.absLineNumber();
                        const message = ' '.join(error.args);
                        errors.push(this.reporter.warning(message, [], { line: lineno }));
                        break;
                    }
                    throw error;
                }
            }
        }
        const [nodelist, blank_finish] = this.comment(match);
        return [[...nodelist, ...errors], blank_finish];
    }

    anonymous(match, context, next_state) {
        // """Anonymous hyperlink targets."""
        const [nodelist, blank_finish] = this.anonymous_target(match);
        this.parent.add(nodelist);
        this.blankFinish = blank_finish;
        return [[], next_state, []];
    }

    blank() {
        this.invalid_input();
    }
}
export default Explicit;
