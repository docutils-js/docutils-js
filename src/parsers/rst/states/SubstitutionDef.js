import Body from './Body';
import { EOFError } from '../../../Exceptions';
import * as nodes from '../../../nodes';
import * as RegExps from '../RegExps';


class SubstitutionDef extends Body {
    /* """
    Parser for the contents of a substitution_definition element.
    """ */
    _init() {
        super._init();
        this.patterns = {
            embedded_directive: new RegExp(`(${RegExps.simplename})::( +|$)`),
            text: '',
};
        this.initialTransitions = ['embedded_directive', 'text'];
    }


    /* eslint-disable-next-line camelcase,no-unused-vars */
    literal_block(match, context, nextState) {
        // """Return a list of nodes."""
        /* eslint-disable-next-line no-unused-vars */
        const [indented, indent, offset, blankFinish] = this.stateMachine.getIndented({});
        while (indented && indented.length && !indented[indented.length - 1].trim()) {
            indented.trimEnd();
        }
        if (!indented || !indented.length) {
            return this.quoted_literal_block();
        }
        const data = indented.join('\n');
        const literalBlock = new nodes.literal_block(data, data);
            const [source, line] = this.stateMachine.getSourceAndLine(offset + 1);
        literalBlock.source = source;
        literalBlock.line = line;
        const nodelist = [literalBlock];
        if (!blankFinish) {
            nodelist.push(this.unindentWarning('Literal block'));
        }
        return nodelist;
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    quoted_literal_block(match, context, nextState) {
        const absLineOffset = this.stateMachine.absLineOffset();
        const offset = this.stateMachine.lineOffset;
        const parentNode = new nodes.Element();
        const newAbsOffset = this.nestedParse(
            this.stateMachine.inputLines.slice(offset),
            {
 inputOffset: absLineOffset,
              node: parentNode,
              matchTitles: false,
                stateMachineKwargs: {
                    stateFactory: this.stateMachine.stateFactory.withStateClasses(['QuotedLiteralBlock']),
                    initialState: 'QuotedLiteralBlock',
},
},
);
        this.gotoLine(newAbsOffset);
        return parentNode.children;
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    embedded_directive(match, context, nextState) {
        const [nodelist, blankFinish] = this.directive(
            match.result,
            { alt: this.parent.attributes.names[0] },
);
        this.parent.add(nodelist);
        if (!this.stateMachine.atEof()) {
            this.blankFinish = blankFinish;
        }
        throw new EOFError();
    }

    /* eslint-disable-next-line no-unused-vars */
    text(match, context, nextState) {
        if (!this.stateMachine.atEof()) {
            this.blankFinish = this.stateMachine.isNextLineBlank();
        }
        throw new EOFError();
    }
}
SubstitutionDef.stateName = 'SubstitutionDef';
SubstitutionDef.constructor.stateName = 'SubstitutionDef';
export default SubstitutionDef;
