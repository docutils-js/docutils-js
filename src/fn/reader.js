import parse from '../parser';

/* eslint-disable-next-line no-unused-vars */
const __docformat__ = 'reStructuredText';

/* read method without callbcks and other junk */
function read(input, settings) {
    return parse(input, settings);
}

export default read;
