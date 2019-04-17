import Body from './Body';

class SubstitutionDef extends Body {
    /* """
    Parser for the contents of a substitution_definition element.
    """ */
    _init() {
        super._init();
        this.patterns = {
            embedded_directive: new RegExp(`(${simplename})::( +|$)`),
            text: '',
};
        this.initialTransitions = ['embedded_directive', 'text'];
    }

    embedded_directive(match, context, next_state) {
        const [nodelist, blank_finish] = this.directive(
            match,
            { alt: this.parent.attributes.names[0] },
);
        this.parent.add(nodelist);
        if (!this.stateMachine.atEof()) {
            this.blankFinish = blank_finish;
        }
        throw new EOFError();
    }

    text(match, context, next_state) {
        if (!this.stateMachine.atEof()) {
            this.blankFinish = this.stateMachine.isNextLineBlank();
        }
        throw new EOFError();
    }
}
SubstitutionDef.stateName = 'SubstitutionDef';
SubstitutionDef.constructor.stateName = 'SubstitutionDef';
export default SubstitutionDef;
