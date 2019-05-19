import BaseWriter from '../Writer';
import { GenericNodeVisitor } from '../nodes';

const __version__ = '';
/* eslint-disable-next-line no-unused-vars */
const __docformat__ = 'reStructuredText';

/**
 * Writer class for POJOWriter
 */
class NoOpWriter extends BaseWriter {
    /**
      * Create POJOWriter
      * @param {Object} args - Arguments, none right now
      */
    constructor(args) {
        super(args);
    }

    /**
     * Translate the document to plain old javascript object
     */
    translate() {
        this.output = this.document;
    }
}

NoOpWriter.settingsSpec = [
    '"Docutils-js POJO" Writer Options',
    null,
    []];
export default NoOpWriter;
