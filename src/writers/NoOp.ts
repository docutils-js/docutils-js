import BaseWriter from '../Writer';

/* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
const __docformat__ = 'reStructuredText';

/**
 * Writer class for POJOWriter
 */
class NoOpWriter extends BaseWriter {
    /**
     * Translate the document to plain old javascript object
     */
    public translate(): void {
        this.output = this.document;
    }
}

// NoOpWriter.settingsSpec = [
//     '"Docutils-js POJO" Writer Options',
//     null,
//     []];
export default NoOpWriter;
