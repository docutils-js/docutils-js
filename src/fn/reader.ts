import parse from '../parse';
import {Settings} from "../../gen/Settings";
import { Document } from '../types'

/* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
const __docformat__ = 'reStructuredText';

function read(input: string, settings: Settings): Document | undefined {
    return parse(input, settings);
}

export default read;
