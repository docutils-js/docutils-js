import {Publisher} from '../src/Publisher';
import { StringInput } from'../src/io';
import sinon from 'sinon';

test('1',() => {

const input = new StringInput('');
sinon.spy(input, 'read');
const p = new Publisher({source: input});
// @ts-ignore
expect(input.read.calledOnce).toBeTruthy();
});
