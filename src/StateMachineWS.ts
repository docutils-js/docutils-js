import {StateMachine} from './StateMachine';
import { Document, GetIndentedArgs, WhitespaceStatemachine } from "./types";
import StringList from "./StringList";

interface GetFirstKnownIndentedArgs {
    indent: number;
    untilBlank?: boolean;
    stripIndent?: boolean;
    stripTop?: boolean;
}

class StateMachineWS extends StateMachine implements WhitespaceStatemachine {
    public document?: Document;

    public matchTitles?: boolean;

    public getIndented(labeled: GetIndentedArgs): [StringList, number, number, boolean] {
        /* istanbul ignore if */
        const cArgs = {...labeled};
        if (typeof labeled.stripIndent === 'undefined') {
            cArgs.stripIndent = true;
        }
        let offset = this.absLineOffset() || 0;

        const [indented, indent, blankFinish] = this.inputLines.getIndented({
            start: this.lineOffset,
            untilBlank: cArgs.untilBlank,
            stripIndent: cArgs.stripIndent,
        });
        if (indented) {
            this.nextLine(indented.length - 1);
        }
        while (indented && indented.length && !(indented[0].trim())) {
            indented.trimStart();
            offset += 1;
        }
        return [indented, indent, offset, blankFinish];
    }

    public getKnownIndented(labeled: GetIndentedArgs): [StringList, number, boolean] {
        const cArgs: GetIndentedArgs = {...labeled};
        /* istanbul ignore if */
        if (typeof cArgs.stripIndent === 'undefined') {
            cArgs.stripIndent = true;
        }
        let offset = this.absLineOffset() || 0;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [indented, indent, blankFinish] = this.inputLines.getIndented({
            start: this.lineOffset,
            untilBlank: cArgs.untilBlank, stripIndent: cArgs.stripIndent, blockIndent:
            cArgs.indent,
        });
        this.nextLine(indented.length - 1);
        while (indented.length && !(indented[0].trim())) {
            indented.trimStart();
            offset += 1;
        }
        return [indented, offset, blankFinish];
    }

    public getFirstKnownIndented(args: GetIndentedArgs):  [StringList, number, number, boolean] {
        const cArgs: GetIndentedArgs = {...args};
        /* istanbul ignore if */
        if (cArgs.stripIndent === undefined) {
            cArgs.stripIndent = true;
        }
        /* istanbul ignore if */
        if (cArgs.stripTop === undefined) {
            cArgs.stripTop = true;
        }
        let offset = this.absLineOffset() || 0;
        const [indented, indent, blankFinish] = this.inputLines.getIndented({
            start: this.lineOffset,
            untilBlank: cArgs.untilBlank,
            stripIndent: cArgs.stripIndent,
            firstIndent: cArgs.indent,
        });
        this.nextLine(indented.length - 1);
        if (cArgs.stripTop) {
            while (indented.length && !(indented[0].trim())) {
                indented.trimStart();
                offset += 1;
            }
        }
        return [indented, indent, offset, blankFinish];
    }
}

export default StateMachineWS;
