import RSTState from '../../../../src/parsers/rst/states/RSTState';
import RSTStateMachine from '../../../../src/parsers/rst/RSTStateMachine';
import StateFactory from '../../../../src/parsers/rst/StateFactory';
import { createLogger} from '../../../../src/testUtils';

jest.mock('../../../../src/parsers/rst/RSTStateMachine');
jest.mock('../../../../src/parsers/rst/StateFactory');

const logger = createLogger();

beforeAll(() => {
    // @ts-ignore
    RSTStateMachine.mockClear();
    // @ts-ignore
    StateFactory.mockClear();
        /* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
    // @ts-ignore
    // @ts-ignore
    RSTStateMachine.mockImplementation((...cargs) => ({
        /* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
            stateFactory: { withStateClasses: (classes: any) => new StateFactory({logger}) },
        }));
});

test('RSTState.constructor', () => {
    // @ts-ignore
    // @ts-ignore
    const rstState = new RSTState({ stateMachine: new RSTStateMachine({}),
                                    debug: true,
    });
    expect(rstState).toBeDefined();
});
