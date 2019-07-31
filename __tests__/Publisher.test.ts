import {Publisher} from '../src/Publisher';
import { StringInput } from'../src/io';
import { createPublisher,createLogger } from '../src/testUtils';
import sinon from 'sinon';

test.skip('1',() => {
const logger = createLogger();
const input = new StringInput('', logger);
sinon.spy(input, 'read');
const p = createPublisher();
// @ts-ignore
expect(input.read.calledOnce).toBeTruthy();
});
