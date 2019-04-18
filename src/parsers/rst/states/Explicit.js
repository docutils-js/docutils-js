import SpecializedBody from './SpecializedBody';
import MarkupError from '../MarkupError';

class Explicit extends SpecializedBody {
    /*
    """Second and subsequent explicit markup construct."""
    */
    /* eslint-disable-next-line camelcase */
    explicit_markup(match, context, nextState) {
        // """Footnotes, hyperlink targets, directives, comments."""
        const [nodelist, blankFinish] = this.explicit_construct(match);
        this.parent.add(nodelist);
        this.blankFinish = blankFinish;
        return [[], nextState, []];
    }

    /* eslint-disable-next-line camelcase */
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
        const [nodelist, blankFinish] = this.comment(match);
        return [[...nodelist, ...errors], blankFinish];
    }

    anonymous(match, context, nextState) {
        // """Anonymous hyperlink targets."""
        const [nodelist, blankFinish] = this.anonymous_target(match);
        this.parent.add(nodelist);
        this.blankFinish = blankFinish;
        return [[], nextState, []];
    }

    blank() {
        this.invalid_input();
    }
}
Explicit.stateName = 'Explicit';
Explicit.constructor.stateName = 'Explicit';
export default Explicit;
