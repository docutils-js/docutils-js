import SpecializedText from './SpecializedText';
import { columnWidth } from '../../../utils';
import { ApplicationError, EOFError, InvalidStateError } from "../../../Exceptions";
import * as nodes from '../../../nodes';
import StateCorrection from '../../../StateCorrection';
import RSTStateMachine from "../RSTStateMachine";
import {RSTStateArgs} from "../types";


class Line extends SpecializedText {
    private eofcheck: boolean = true;

    // @ts-ignore
    public indent(...args) {
        // @ts-ignore
        return this.text(...args);
    }

    // @ts-ignore
    public eof(context) {
        if(this.memo === undefined) {
            throw new InvalidStateError();
        }
        const marker = context[0].trim();
        if (this.memo.sectionBubbleUpKludge) {
            this.memo.sectionBubbleUpKludge = false;
        } else if (marker.length < 4) {
            this.stateCorrection(context);
        }
        if (this.eofcheck) {
            const lineno = this.rstStateMachine.absLineNumber() - 1;
            const transition = new nodes.transition(context[0]);
            transition.line = lineno;
            this.parent!.add(transition);
        }
        this.eofcheck = true;
        return [];
    }

    /** Transition marker. */
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
    // @ts-ignore
    public blank(match, context, nextState) {
        const [src, srcline] = this.rstStateMachine.getSourceAndLine();
        const marker = context[0].trim();
        if (marker.length < 4) {
            this.stateCorrection(context);
        }
        const transition = new nodes.transition(marker);
        transition.source = src;
        transition.line = srcline === undefined ? -1 : srcline - 1;
        this.parent!.add(transition);
        return [[], 'Body', []];
    }

    /** Potential over- & underlined title. */
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
    // @ts-ignore
    public text(match, context, nextState) {
        const lineno = this.rstStateMachine.absLineNumber() - 1;
        let overline = context[0];
        let title = match.result.input;
        let underline: string|undefined = '';
        try {
            underline = this.rstStateMachine.nextLine();
        } catch (error) {
            if (error instanceof EOFError) {
                const blocktext = `${overline}\n${title}`;
                if (overline.trimEnd().length < 4) {
                    this.shortOverline(context, blocktext, lineno, 2);
                } else {
                    const msg = this.reporter!.severe(
                        'Incomplete section title.',
                        [new nodes.literal_block(blocktext, blocktext)],
                        { line: lineno },
                    );
                    this.parent!.add(msg);
                    return [[], 'Body', []];
                }
            } else {
                throw error;
            }
        }
        const source = [overline, title, underline].join('\n');
        overline = overline.trimRight();
        underline = underline || '';
        underline = underline.trimRight();

        if (!this.transitions.underline[0].test(underline)) {
            const blocktext = `${overline}\n${title}\n${underline}`;
            if (overline.trimEnd().length < 4) {
                this.shortOverline(context, blocktext, lineno, 2);
            } else {
                const msg = this.reporter!.severe(
                    'Missing matching underline for section title overline.',
                    [new nodes.literal_block(source, source)],
                    { line: lineno },
                );
                this.parent!.add(msg);
                return [[], 'Body', []];
            }
        } else if (overline !== underline) {
            const blocktext = `${overline}\n${title}\n${underline}`;
            if (overline.trimEnd().length < 4) {
                this.shortOverline(context, blocktext, lineno, 2);
            } else {
                const msg = this.reporter!.severe(
                    'Title overline & underline mismatch.',
                    [new nodes.literal_block(source, source)],
                    { line: lineno },
                );
                this.parent!.add(msg);
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
                const msg = this.reporter!.warning(
                    'Title overline too short.',
                    [new nodes.literal_block(source, source)],
                    { line: lineno },
                );
                messages.push(msg);
            }
        }
        const style = [overline[0], underline[0]];
        this.eofcheck = false; // @@@ not sure this is correct
        this.section({
            title: title.trimStart(), source, style, lineno: lineno + 1, messages,
        });
        this.eofcheck = true;
        return [[], 'Body', []];
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
    // @ts-ignore
    public underline(match, context, nextState) {
        const overline = context[0];
        const blocktext = `${overline}\n${this.rstStateMachine.line}`;
        const lineno = this.rstStateMachine.absLineNumber() - 1;
        if (overline.trimEnd().length < 4) {
            this.shortOverline(context, blocktext, lineno, 1);
        }
        const msg = this.reporter!.error(
            'Invalid section title or transition marker.',
            [new nodes.literal_block(blocktext, blocktext)],
            { line: lineno },
        );
        this.parent!.add(msg);
        return [[], 'Body', []];
    }

    public shortOverline(context: any[], blocktext: any | any[], lineno: number, lines = 1): void {
        const msg = this.reporter!.info(
            'Possible incomplete section title.\nTreating the overline as '
            + "ordinary text because it's so short.", [],
            { line: lineno },
        );
        this.parent!.add(msg);
        this.stateCorrection(context, lines);
    }

    public stateCorrection(context: any[], lines = 1): never {
        this.rstStateMachine.previousLine(lines);
        context.length = 0;
        throw new StateCorrection('Body', 'text');
    }
}
Line.stateName = 'Line';
export default Line;
