import { Body, stateClasses } from '../../../src/parsers/rst/States';
import RSTStateMachine from '../../../src/parsers/rst/RSTStateMachine';
jest.mock('../../../src/parsers/rst/RSTStateMachine');

function createsm() {
        const sm = new RSTStateMachine({ stateClasses, initialState: 'Body',
				     debug: true,
					 debugFn: console.log });
    return sm;
}
test.only('Body patterns', () => {
    const stateMachine = createsm();
    const body = new Body({ stateMachine });
    expect(body.patterns).toMatchSnapshot();
});
    
test('body constructor',
     () => {
	 const mockSm = jest.mock();
	 const body = new Body({
 stateMachine: mockSm,
				debug: true,
});
     });


test('body constructor',
     () => {
	 const mockSm = jest.mock();
	 const body = new Body({
 stateMachine: mockSm,
				debug: true,
});
     });
