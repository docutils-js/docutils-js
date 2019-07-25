import QuotedLiteralBlock from '../../../../src/parsers/rst/states/QuotedLiteralBlock';
import StateFactory from  '../../../../src/parsers/rst/StateFactory';
import { Rststatemachine } from '../../../../src/parsers/rst/types';
import RSTStateMachine from '../../../../src/parsers/rst/RSTStateMachine';
import sinon from 'sinon';

test('1', (): void => {
const stateFactory = new StateFactory({});
const rsm = new RSTStateMachine({ stateFactory, initialState: 'QuotedLiteralBlock'});
const sm = sinon.mock(rsm);
// @ts-ignore
const state = factory.createState('QuotedLiteralBlock', sm);
});