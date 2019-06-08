import NestedStateMachine from '../../../src/parsers/rst/NestedStateMachine';
import {StateMachineRunArgs} from "../../../src/types";



test('NestedStateMachine.constructor', () => {
    const args: StateMachineRunArgs = {
        inputLines: ['foo',]
    };
const sm = new NestedStateMachine(args);
});
