import { StateMachine } from './StateMachine';


test.skip('construct StateMachine', () => {
    try
    {
	const sot = new StateMachine({stateClasses:[]});
	sot.run(["test"]);
    } catch(error) {
	console.log(error.stack);
	console.log(error.message);
    }
    
});
