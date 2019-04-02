import { Body } from './States';

test('body constructor',
     () => {
	 const mockSm = jest.mock();
	 const body = new Body({stateMachine: mockSm,
				debug: true});
     }
    )

