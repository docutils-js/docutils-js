import * as RSTStates from './RSTStates';
import { Statefactory, StateInterface, Statemachine, StateType } from "../../types";

class StateFactory implements Statefactory {
    private stateClasses: StateType[]= [];
    private args: any | undefined;
    public constructor(args?: { stateClasses?: StateType[] }) {
        this.args = args;
        if (args && args.stateClasses && args.stateClasses.length) {
            this.stateClasses = args.stateClasses;
        } else {
            this.stateClasses = [RSTStates.Body,
                RSTStates.BulletList,
                RSTStates.DefinitionList,
                RSTStates.EnumeratedList,
                RSTStates.FieldList,
                RSTStates.OptionList,
                RSTStates.LineBlock,
                RSTStates.ExtensionOptions,
                RSTStates.Explicit,
                RSTStates.Text,
                RSTStates.Definition,
                RSTStates.Line,
                RSTStates.SubstitutionDef];
        }
    }

    /* istanbul ignore next */
    public createBody() {
        return this.createState('Body');
    }

    /* istanbul ignore next */
    public createBulletList() {
        return this.createState('BulletList');
    }

    /* istanbul ignore next */
    public createDefinition() {
        return this.createState('Definition');
    }

    /* istanbul ignore next */
    public createDefinitionList() {
        return this.createState('DefinitionList');
    }

    /* istanbul ignore next */
    public createEnumeratedList() {
        return this.createState('EnumeratedList');
    }

    /* istanbul ignore next */
    public createExplicit() {
        return this.createState('Explicit');
    }

    /* istanbul ignore next */
    public createExtensionOptions() {
        return this.createState('ExtensionOptions');
    }

    /* istanbul ignore next */
    public createFieldList() {
        return this.createState('FieldList');
    }

    /* istanbul ignore next */
    public createLineBlock() {
        return this.createState('LineBlock');
    }

    /* istanbul ignore next */
    public createLine() {
        return this.createState('Line');
    }

    /* istanbul ignore next */
    public createOptionList() {
        return this.createState('OptionList');
    }

    /* istanbul ignore next */
    public createQuotedLiteralBlock() {
        return this.createState('QuotedLiteralBlock');
    }

    /* istanbul ignore next */
    public createSpecializedBody() {
        return this.createState('SpecializedBody');
    }

    /* istanbul ignore next */
    public createSpecializedText() {
        return this.createState('SpecializedText');
    }

    /* istanbul ignore next */
    public createText() {
        return this.createState('Text');
    }

    public createState(stateName: string, stateMachine?: Statemachine) {
        if (typeof stateName === 'undefined') {
            throw new Error('Need argument stateName');
        }

        if (typeof stateMachine === 'undefined') {
            throw new Error('Need argument stateMAchine');
        }

        if (!Object.prototype.hasOwnProperty.call(RSTStates, stateName)) {
            throw new Error(`Unknown state ${stateName}`);
        }
        // @ts-ignore
        const StateClass = RSTStates[stateName];
        return new StateClass(stateMachine, { });
    }

    public getStateClasses(): StateType[] {
        return this.stateClasses;
    }

    public withStateClasses(stateClasses: StateType[]): Statefactory {
        return new StateFactory({ stateClasses });
    }
}

export default StateFactory;
