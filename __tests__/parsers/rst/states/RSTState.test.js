import RSTState from '../../../../src/parsers/rst/states/RSTState';
import RSTStateMachine from '../../../../src/parsers/rst/RSTStateMachine';
import StateFactory from '../../../../src/parsers/rst/StateFactory';

jest.mock('../../../../src/parsers/rst/RSTStateMachine');
jest.mock('../../../../src/parsers/rst/StateFactory');

beforeAll(() => {
    RSTStateMachine.mockClear();
    StateFactory.mockClear();
    RSTStateMachine.mockImplementation((...cargs) => ({
            stateFactory: { withStateClasses: classes => new StateFactory() },
        }));
});

test('RSTState.constructor', () => {
    const rstState = new RSTState({
 stateMachine: new RSTStateMachine(),
				    debug: true,
});
});
