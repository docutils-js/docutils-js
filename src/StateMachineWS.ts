import { StateMachine } from './StateMachine';
import { label } from './nodes';
import {GetIndentedArgs} from "./types";

interface GetFirstKnownIndentedArgs {
    indent: number;
    untilBlank?: boolean;
    stripIndent?: boolean;
    stripTop?: boolean;
}

class StateMachineWS extends StateMachine {
    public document: any;

    public matchTitles?: boolean;

    getIndented(labeled: GetIndentedArgs) {
      /* istanbul ignore if */
        const cArgs = { ... labeled };
      if (typeof labeled.stripIndent === 'undefined') {
        cArgs.stripIndent = true;
      }
      let offset = this.absLineOffset();

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

    getKnownIndented(labeled: GetIndentedArgs) {
      const cArgs: GetIndentedArgs = { ...labeled};
       /* istanbul ignore if */
      if (typeof cArgs.stripIndent === 'undefined') {
        cArgs.stripIndent = true;
      }
      let offset = this.absLineOffset();
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

    getFirstKnownIndented(args: GetIndentedArgs) {
      const cArgs: GetIndentedArgs = { ... args };
      /* istanbul ignore if */
      if (cArgs.stripIndent === undefined) {
        cArgs.stripIndent = true;
      }
      /* istanbul ignore if */
      if (cArgs.stripTop === undefined) {
        cArgs.stripTop = true;
      }
      let offset = this.absLineOffset();
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
