import Body from './Body';
import { EOFError } from '../../../Exceptions';
import * as nodes from '../../../nodes';
import * as RegExps from '../RegExps';
import RSTStateMachine from "../RSTStateMachine";
import {RSTStateArgs} from "../types";
import { NodeInterface, StateInterface, RegexpResult, ContextArray, ParseMethodReturnType } from "../../../types";
import StringList from "../../../StringList";

/** Parser for the contents of a substitution_definition element. */
class SubstitutionDef extends Body {
    public _init(stateMachine: RSTStateMachine, debug: boolean = false) {
        super._init(stateMachine, debug);
        this.patterns = {
            // eslint-disable-next-line @typescript-eslint/camelcase
            embedded_directive: new RegExp(`(${RegExps.simplename})::( +|$)`),
            text: '',
        };
        this.initialTransitions = ['embedded_directive', 'text'];
    }

    /** Return a list of nodes. */
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type,@typescript-eslint/no-unused-vars,@typescript-eslint/camelcase
    public literal_block(match: {}, context: string[], nextState: StateInterface) {
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
        if(source !== undefined) {
            literalBlock.source = source;
        }
        if(line !== undefined) {
            literalBlock.line = line;
        }
        const nodelist: NodeInterface[] = [literalBlock];
        if (!blankFinish) {
            nodelist.push(this.unindentWarning('Literal block'));
        }
        return nodelist;
    }

    /* eslint-disable-next-line @typescript-eslint/camelcase,camelcase,@typescript-eslint/no-unused-vars,no-unused-vars */
    public quoted_literal_block(): NodeInterface[] {
        const absLineOffset = this.rstStateMachine.absLineOffset();
        const offset = this.rstStateMachine.lineOffset;
        const parentNode = new nodes.Element();
        const newAbsOffset = this.nestedParse(
            this.rstStateMachine.inputLines.slice(offset) as StringList,
            absLineOffset,
            parentNode,
            false)
        // stateMachineKwargs: {
        //     // @ts-ignore
        //     stateFactory: this.rstStateMachine.stateFactory!.withStateClasses(['QuotedLiteralBlock']),
        //     initialState: 'QuotedLiteralBlock',
        // },

        //@ts-ignore
        this.gotoLine(newAbsOffset!);
        return parentNode.children;
    }

    /* eslint-disable-next-line @typescript-eslint/camelcase,camelcase,@typescript-eslint/no-unused-vars,no-unused-vars */
    // @ts-ignore
    public embedded_directive(match, context, nextState) {
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
    public text(match: RegexpResult, context: ContextArray, nextState: StateInterface): ParseMethodReturnType {
        if (!this.rstStateMachine.atEof()) {
            this.blankFinish = this.rstStateMachine.isNextLineBlank();
        }
        throw new EOFError();
    }
}
SubstitutionDef.stateName = 'SubstitutionDef';
//SubstitutionDef.constructor.stateName = 'SubstitutionDef';
export default SubstitutionDef;
