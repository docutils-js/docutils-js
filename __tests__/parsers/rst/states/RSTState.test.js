import RSTState from '../../../../src/parsers/rst/states/RSTState';
import RSTStateMachine from '../../../../src/parsers/rst/RSTStateMachine';
jest.mock('../../../../src/parsers/rst/RSTStateMachine');

test('RSTState.constructor', () => {
    const rstState = new RSTState({ stateMachine: new RSTStateMachine(),
				    debug: true });
});
