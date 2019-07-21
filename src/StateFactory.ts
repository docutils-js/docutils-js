import { Statefactory, StateInterface, Statemachine, StateType } from "./types";
import uuidv1 from 'uuid/v1';

class StateFactory implements Statefactory {
    private stateClasses: StateType[]= [];
    private args: any | undefined;
    public constructor(args?: { stateClasses?: StateType[] }) {
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

    public getStateClasses(): StateType[] {
        return this.stateClasses;
    }

    public withStateClasses(stateClasses: StateType[]): Statefactory {
        return new StateFactory({ stateClasses });
    }
}

export default StateFactory;
