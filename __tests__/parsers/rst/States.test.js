import { Body } from '../../../src/parsers/rst/States';

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
