import StateFactory  from '../../../../src/parsers/rst/StateFactory';
import { createStateFactory }from '../../../../src/testUtils';

test('states', () => {
const factory = createStateFactory();
const cary = factory.getStateClasses();
console.log(cary);
});
