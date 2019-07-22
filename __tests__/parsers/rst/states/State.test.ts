import StateFactory  from '../../../../src/parsers/rst/StateFactory';

test('states', () => {
const factory = new StateFactory({});
const cary = factory.getStateClasses();
console.log(cary);
});
