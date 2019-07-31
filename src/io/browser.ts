import Input from './Input';

import { ReadInputCallback, InputConstructorArgs } from '../types';
export abstract class BrowserStreamInput extends Input {
    public constructor(args: InputConstructorArgs) {
        super(args);
    }
}
