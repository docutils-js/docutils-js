import { StateMachine } from './StateMachine';

class StateMachineWS extends StateMachine {
    getIndented({ untilBlank, stripIndent }) {
        if (stripIndent === undefined) {
            stripIndent = true;
        }
        let offset = this.absLineOffset();
        const [indented, indent, blankFinish] = this.inputLines.getIndented({
            start: this.lineOffset,
            untilBlank,
            stripIndent,
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

    getKnownIndented({ indent, untilBlank, stripIndent }) {
        let indented; let
blankFinish;
        if (stripIndent === undefined) {
            stripIndent = true;
        }
        let offset = this.absLineOffset();
        [indented, indent, blankFinish] = this.inputLines.getIndented({
 start: this.lineOffset, untilBlank, stripIndent, blockIndent: indent,
});
        this.nextLine(indented.length - 1);
        while (indented.length && !(indented[0].trim())) {
            indented.trimStart();
            offset += 1;
        }
        return [indented, offset, blankFinish];
    }

    getFirstKnownIndented({
 indent, untilBlank, stripIndent, stripTop,
}) {
        let indented;
        let blankFinish;
        if (stripIndent === undefined) {
            stripIndent = true;
        }
        if (stripTop === undefined) {
            stripTop = true;
        }
        let offset = this.absLineOffset();
        [indented, indent, blankFinish] = this.inputLines.getIndented({
            start: this.lineOffset,
untilBlank,
stripIndent,
            firstIndent: indent,
});
        this.nextLine(indented.length - 1);
        if (stripTop) {
            while (indented.length && !(indented[0].trim())) {
                indented.trimStart();
                offset += 1;
            }
        }
        return [indented, indent, offset, blankFinish];
    }
}

export default StateMachineWS;
