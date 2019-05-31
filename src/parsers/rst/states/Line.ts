import SpecializedText from './SpecializedText';
import { columnWidth } from '../../../utils';
import { EOFError } from '../../../Exceptions';
import * as nodes from '../../../nodes';
import StateCorrection from '../../../StateCorrection';


class Line extends SpecializedText {
    _init(args) {
        super._init(args);
        this.eofcheck = 1;
    }

    indent(...args) {
        return this.text(...args);
    }

    eof(context) {
        const marker = context[0].trim();
        if (this.memo.sectionBubbleUpKludge) {
            this.memo.sectionBubbleUpKludge = false;
        } else if (marker.length < 4) {
            this.stateCorrection(context);
        }
        if (this.eofcheck) {
            const lineno = this.stateMachine.absLineNumber() - 1;
            const transition = new nodes.transition(context[0]);
            transition.line = lineno;
            this.parent.add(transition);
        }
        this.eofcheck = 1;
        return [];
    }

    /** Transition marker. */
    /* eslint-disable-next-line no-unused-vars */
    blank(match, context, nextState) {
        const [src, srcline] = this.stateMachine.getSourceAndLine();
        const marker = context[0].trim();
        if (marker.length < 4) {
            this.stateCorrection(context);
        }
        const transition = new nodes.transition(marker);
        transition.source = src;
        transition.line = srcline - 1;
        this.parent.add(transition);
        return [[], 'Body', []];
    }

    /** Potential over- & underlined title. */
    /* eslint-disable-next-line no-unused-vars */
    text(match, context, nextState) {
        const lineno = this.stateMachine.absLineNumber() - 1;
        let overline = context[0];
        let title = match.result.input;
        let underline = '';
        try {
            underline = this.stateMachine.nextLine();
        } catch (error) {
            if (error instanceof EOFError) {
                const blocktext = `${overline}\n${title}`;
                if (overline.trimEnd().length < 4) {
                    this.shortOverline(context, blocktext, lineno, 2);
                } else {
                    const msg = this.reporter.severe(
                        'Incomplete section title.',
                        [new nodes.literal_block(blocktext, blocktext)],
                        { line: lineno },
);
                    this.parent.add(msg);
                    return [[], 'Body', []];
                }
            } else {
                throw error;
            }
        }
        const source = [overline, title, underline].join('\n');
        overline = overline.trimEnd();
        underline = underline.trimEnd();
        if (!this.transitions.underline[0].test(underline)) {
            const blocktext = `${overline}\n${title}\n${underline}`;
            if (overline.trimEnd().length < 4) {
                this.shortOverline(context, blocktext, lineno, 2);
            } else {
                const msg = this.reporter.severe(
                    'Missing matching underline for section title overline.',
                    [new nodes.literal_block(source, source)],
                    { line: lineno },
);
                this.parent.add(msg);
                return [[], 'Body', []];
            }
        } else if (overline !== underline) {
            const blocktext = `${overline}\n${title}\n${underline}`;
            if (overline.trimEnd().length < 4) {
                this.shortOverline(context, blocktext, lineno, 2);
            } else {
                const msg = this.reporter.severe(
                    'Title overline & underline mismatch.',
                    [new nodes.literal_block(source, source)],
                    { line: lineno },
);
                this.parent.add(msg);
                return [[], 'Body', []];
            }
        }
        title = title.trimEnd();
        const messages = [];
        if (columnWidth(title) > overline.length) {
            const blocktext = `${overline}\n${title}\n${underline}`;
            if (overline.trimEnd().length < 4) {
                this.shortOverline(context, blocktext, lineno, 2);
            } else {
                const msg = this.reporter.warning(
                    'Title overline too short.',
                    [new nodes.literal_block(source, source)],
                    { line: lineno },
);
                messages.push(msg);
            }
        }
        const style = [overline[0], underline[0]];
        this.eofcheck = 0; // @@@ not sure this is correct
        this.section({
 title: title.trimStart(), source, style, lineno: lineno + 1, messages,
});
        this.eofcheck = 1;
        return [[], 'Body', []];
    }

    /* eslint-disable-next-line no-unused-vars */
    underline(match, context, nextState) {
        const overline = context[0];
        const blocktext = `${overline}\n${this.stateMachine.line}`;
        const lineno = this.stateMachine.absLineNumber() - 1;
        if (overline.trimEnd().length < 4) {
            this.shortOverline(context, blocktext, lineno, 1);
        }
        const msg = this.reporter.error(
            'Invalid section title or transition marker.',
            [new nodes.literal_block(blocktext, blocktext)],
            { line: lineno },
);
        this.parent.add(msg);
        return [[], 'Body', []];
    }

    shortOverline(context, blocktext, lineno, lines = 1) {
        const msg = this.reporter.info(
            'Possible incomplete section title.\nTreating the overline as '
            + "ordinary text because it's so short.", [],
            { line: lineno },
);
        this.parent.add(msg);
        this.stateCorrection(context, lines);
    }

    stateCorrection(context, lines = 1) {
        this.stateMachine.previousLine(lines);
        context.length = 0;
        throw new StateCorrection('Body', 'text');
    }
}
Line.stateName = 'Line';
Line.constructor.stateName = 'Line';
export default Line;
