import parse from '../parse';
import {Settings} from "../../gen/Settings";

/* eslint-disable-next-line no-unused-vars */
const __docformat__ = 'reStructuredText';

function read(input: string, settings: Settings) {
    return parse(input, settings);
}

export default read;
