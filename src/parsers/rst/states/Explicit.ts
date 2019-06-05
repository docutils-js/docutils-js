import SpecializedBody from './SpecializedBody';
import MarkupError from '../MarkupError';
/** Second and subsequent explicit markup construct. */
class Explicit extends SpecializedBody {
    /** Footnotes, hyperlink targets, directives, comments. */
    /* eslint-disable-next-line camelcase */
    explicit_markup(match, context, nextState) {
        const [nodelist, blankFinish] = this.explicit_construct(match);
        this.parent.add(nodelist);
        this.blankFinish = blankFinish;
        return [[], nextState, []];
    }

    /** Determine which explicit construct this is, parse & return it. */
    /* eslint-disable-next-line camelcase */
    explicit_construct(match) {
        const errors = [];
        /* eslint-disable-next-line no-restricted-syntax */
        for (const [method, pattern] of this.explicit.constructs) {
            const expmatch = pattern.exec(match.result.input);
            if (expmatch) {
                try {
                    const r = method(expmatch);
//                  console.log(r);
                    return r;
                } catch (error) {
                    if (error instanceof MarkupError) {
                        const lineno = this.rstStateMachine.absLineNumber();
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

    /** Anonymous hyperlink targets. */
    anonymous(match, context, nextState) {
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
