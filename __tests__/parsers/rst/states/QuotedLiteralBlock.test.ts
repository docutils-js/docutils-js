import QuotedLiteralBlock from '../../../../src/parsers/rst/states/QuotedLiteralBlock';
import StateFactory from  '../../../../src/parsers/rst/StateFactory';
import { Rststatemachine } from '../../../../src/parsers/rst/types';
import RSTStateMachine from '../../../../src/parsers/rst/RSTStateMachine';
import { createStateFactory, createLogger } from '../../../../src/testUtils';
import sinon from 'sinon';

       test.skip('1', (): void => {
       const logger= createLogger();
const stateFactory = createStateFactory();
const rsm = new RSTStateMachine({ logger,stateFactory, initialState: 'QuotedLiteralBlock'});
const sm = sinon.mock(rsm);
// @ts-ignore
const state = statefactory.createState('QuotedLiteralBlock', sm);
});