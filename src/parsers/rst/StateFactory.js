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

    createBody() {
	return this.createState('Body');
    }

    createBulletList() {
	return this.createState('BulletList');
    }

    createDefinition() {
	return this.createState('Definition');
    }

    createDefinitionList() {
	return this.createState('DefinitionList');
    }

    createEnumeratedList() {
	return this.createState('EnumeratedList');
    }

    createExplicit() {
	return this.createState('Explicit');
    }

    createExtensionOptions() {
	return this.createState('ExtensionOptions');
    }

    createFieldList() {
	return this.createState('FieldList');
    }

    createLineBlock() {
	return this.createState('LineBlock');
    }

    createLine() {
	return this.createState('Line');
    }

    createOptionList() {
	return this.createState('OptionList');
    }

    createQuotedLiteralBlock() {
	return this.createState('QuotedLiteralBlock');
    }

    createRSTState() {
	return this.createState('RSTState');
    }

    createSpecializedBody() {
	return this.createState('SpecializedBody');
    }

    createSpecializedText() {
	return this.createState('SpecializedText');
    }

    createText() {
	return this.createState('Text');
    }

    createState(stateName, stateMachine) {
	if(typeof stateMachine === 'undefined') {
	    throw new Error("Need argument stateMAchine");
	}
	
	if(!RSTStates.hasOwnProperty(stateName)) {
	    throw new Error(`Unknown state ${stateName}`);
	}
	const StateClass = RSTStates[stateName];
	return new StateClass(stateMachine);
    }

    getStateClasses() {
	return this.stateClasses;
    }

    withStateClasses(stateClasses) {
	return new StateFactory({ stateClasses });
    }
}

export default StateFactory;
