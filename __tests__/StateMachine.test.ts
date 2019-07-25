import sinon from 'sinon';
import { StateMachineConstructorArgs} from '../src/types';
import { StateMachine } from '../src/StateMachine';
import StateFactory from '../src/StateFactory';

beforeAll(() => {
// @ts-ignore
});

test('StateFactory.constructor', () => {
const stateFactory = new StateFactory({});
const sfSpy = sinon.spy(stateFactory);
const initialState = 'NoState';
// @ts-ignore
  const args: StateMachineConstructorArgs = { stateFactory: sfSpy, initialState};
  const sm = new StateMachine(args);
  expect(sm).toBeDefined();
//@ts-ignore
expect(StateFactory.constructor.calledOnce).toBeTruthy();
});

test('no input', () =>{
const stateFactory = new StateFactory({});
const initialState = 'NoState';
  const args: StateMachineConstructorArgs = { stateFactory, initialState};
  const sm = new StateMachine(args);
  expect(sm).toBeDefined();
  expect(() => sm.run('', 0)).toThrow();
});


