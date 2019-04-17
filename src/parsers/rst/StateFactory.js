import * as RSTStates from './RSTStates';

class StateFactory {
    constructor(args) {
	this.args = args;
	if(args && args.stateClasses) {
	    this.stateClasses = args.stateClasses;
	} else {
	    this.stateClasses = [RSTStates.Body, RSTStates.BulletList, RSTStates.DefinitionList, RSTStates.EnumeratedList, RSTStates.FieldList, RSTStates.OptionList, RSTStates.LineBlock, RSTStates.ExtensionOptions, RSTStates.Explicit, RSTStates.Text, RSTStates.Definition, RSTStates.Line];
	}
    }

    /* istanbul ignore next */
    createBody() {
	return this.createState('Body');
    }

    /* istanbul ignore next */
    createBulletList() {
	return this.createState('BulletList');
    }

    /* istanbul ignore next */
    createDefinition() {
	return this.createState('Definition');
    }

    /* istanbul ignore next */
    createDefinitionList() {
	return this.createState('DefinitionList');
    }

    /* istanbul ignore next */
    createEnumeratedList() {
	return this.createState('EnumeratedList');
    }

    /* istanbul ignore next */
    createExplicit() {
	return this.createState('Explicit');
    }

    /* istanbul ignore next */
    createExtensionOptions() {
	return this.createState('ExtensionOptions');
    }

    /* istanbul ignore next */
    createFieldList() {
	return this.createState('FieldList');
    }

    /* istanbul ignore next */
    createLineBlock() {
	return this.createState('LineBlock');
    }

    /* istanbul ignore next */
    createLine() {
	return this.createState('Line');
    }

    /* istanbul ignore next */
    createOptionList() {
	return this.createState('OptionList');
    }

    /* istanbul ignore next */
    createQuotedLiteralBlock() {
	return this.createState('QuotedLiteralBlock');
    }

    /* istanbul ignore next */
    createSpecializedBody() {
	return this.createState('SpecializedBody');
    }

    /* istanbul ignore next */
    createSpecializedText() {
	return this.createState('SpecializedText');
    }

    /* istanbul ignore next */
    createText() {
	return this.createState('Text');
    }

    createState(stateName, stateMachine) {
	if(typeof stateName === 'undefined') {
	    throw new Error("Need argument stateName");
	}
	
	if(typeof stateMachine === 'undefined') {
	    throw new Error("Need argument stateMAchine");
	}
	
	if(!RSTStates.hasOwnProperty(stateName)) {
	    throw new Error(`Unknown state ${stateName}`);
	}
	const StateClass = RSTStates[stateName];
	return new StateClass({stateMachine});
    }

    getStateClasses() {
	return this.stateClasses;
    }

    withStateClasses(stateClasses) {
	return new StateFactory({ stateClasses });
    }
}

export default StateFactory;
