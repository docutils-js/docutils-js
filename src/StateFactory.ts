import { Statefactory, StateInterface, Statemachine, StateType, StateConstructor } from "./types";

class StateFactory implements Statefactory {
    private stateClasses: StateConstructor[]= [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private args: any | undefined;
    public constructor(args?: { stateClasses?: StateConstructor[] }) {
        this.args = args;
        if (args && args.stateClasses && args.stateClasses.length) {
            this.stateClasses = args.stateClasses;
        } else {
            this.stateClasses = [];
        }
    }

    public createState(stateName: string, stateMachine?: Statemachine): StateInterface {
        if (typeof stateName === 'undefined') {
            throw new Error('Need argument stateName');
        }

        if (typeof stateMachine === 'undefined') {
            throw new Error('Need argument stateMAchine');
        }
        throw new Error('unimpp');
    }

    public getStateClasses(): StateConstructor[] {
        return this.stateClasses;
    }

    public withStateClasses(stateClasses: StateConstructor[]): this {
        return new StateFactory({ stateClasses }) as this;
    }
}

export default StateFactory;
