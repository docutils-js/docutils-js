import sinon from 'sinon';
import { StateMachineConstructorArgs} from '../src/types';
import { StateMachine } from '../src/StateMachine';
import StateFactory from '../src/StateFactory';
import { createStateFactory, createLogger } from '../src/testUtils';

beforeAll(() => {
// @ts-ignore
});

test('StateFactory.constructor', () => {
  const logger = createLogger();
    const stateFactory = new StateFactory({});
    // @ts-ignore
    sinon.spy(stateFactory, 'getStateClasses');
    const initialState = 'NoState';
    const args: StateMachineConstructorArgs = { stateFactory, initialState, logger};
    const sm = new StateMachine(args);
    expect(sm).toBeDefined();
    //@ts-ignore
    expect(stateFactory.getStateClasses.calledOnce).toBeTruthy();
});

test('no input', () =>{
    const logger = createLogger();
    const stateFactory = createStateFactory();
    const initialState = 'NoState';
    const args: StateMachineConstructorArgs = {
        stateFactory,
        initialState,
        logger,
    };
    const sm = new StateMachine(args);
    expect(sm).toBeDefined();
    expect(() => sm.run('', 0)).toThrow();
});


