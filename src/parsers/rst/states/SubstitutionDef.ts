import Body from './Body';
import { EOFError } from '../../../Exceptions';
import * as nodes from '../../../nodes';
import * as RegExps from '../RegExps';
import RSTStateMachine from "../RSTStateMachine";
import {RSTStateArgs} from "../types";

/** Parser for the contents of a substitution_definition element. */
class SubstitutionDef extends Body {
    _init(stateMachine: RSTStateMachine, args: RSTStateArgs) {
        super._init(stateMachine, args);
        this.patterns = {
            embedded_directive: new RegExp(`(${RegExps.simplename})::( +|$)`),
            text: '',
};
        this.initialTransitions = ['embedded_directive', 'text'];
    }

/** Return a list of nodes. */
    /* eslint-disable-next-line @typescript-eslint/camelcase,camelcase,@typescript-eslint/no-unused-vars,no-unused-vars */
    // @ts-ignore
    literal_block(match, context, nextState) {
        /* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
        const [indented, indent, offset, blankFinish] = this.rstStateMachine.getIndented({});
        while (indented && indented.length && !indented[indented.length - 1].trim()) {
            indented.trimEnd();
        }
        if (!indented || !indented.length) {
            return this.quoted_literal_block();
        }
        const data = indented.join('\n');
        const literalBlock = new nodes.literal_block(data, data);
            const [source, line] = this.rstStateMachine.getSourceAndLine(offset + 1);
        literalBlock.source = source;
        literalBlock.line = line;
        const nodelist: any[] = [literalBlock];
        if (!blankFinish) {
            nodelist.push(this.unindentWarning('Literal block'));
        }
        return nodelist;
    }

    /* eslint-disable-next-line @typescript-eslint/camelcase,camelcase,@typescript-eslint/no-unused-vars,no-unused-vars */
    quoted_literal_block() {
        const absLineOffset = this.rstStateMachine.absLineOffset();
        const offset = this.rstStateMachine.lineOffset;
        const parentNode = new nodes.Element();
        const newAbsOffset = this.nestedParse(

            {
                inputLines: this.rstStateMachine.inputLines.slice(offset),
 inputOffset: absLineOffset,
              node: parentNode,
              matchTitles: false,
                stateMachineKwargs: {
                    stateFactory: this.rstStateMachine.stateFactory.withStateClasses(['QuotedLiteralBlock']),
                    initialState: 'QuotedLiteralBlock',
},
},
);
        this.gotoLine(newAbsOffset);
        return parentNode.children;
    }

    /* eslint-disable-next-line @typescript-eslint/camelcase,camelcase,@typescript-eslint/no-unused-vars,no-unused-vars */
    // @ts-ignore
    embedded_directive(match, context, nextState) {
        const [nodelist, blankFinish] = this.directive(
            match.result,
            { alt: this.parent!.attributes.names[0] },
);
        this.parent!.add(nodelist);
        if (!this.rstStateMachine.atEof()) {
            this.blankFinish = blankFinish;
        }
        throw new EOFError();
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
    text(match: any, context: string[], nextState: any): any[] {
        if (!this.rstStateMachine.atEof()) {
            this.blankFinish = this.rstStateMachine.isNextLineBlank();
        }
        throw new EOFError();
    }
}
SubstitutionDef.stateName = 'SubstitutionDef';
//SubstitutionDef.constructor.stateName = 'SubstitutionDef';
export default SubstitutionDef;
