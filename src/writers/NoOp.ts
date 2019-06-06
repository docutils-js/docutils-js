import BaseWriter from '../Writer';
import {Document} from "../types";

/* eslint-disable-next-line no-unused-vars */
const __docformat__ = 'reStructuredText';

/**
 * Writer class for POJOWriter
 */
class NoOpWriter extends BaseWriter {
    /**
     * Translate the document to plain old javascript object
     */
    translate() {
        this.output = this.document;
    }
}

// NoOpWriter.settingsSpec = [
//     '"Docutils-js POJO" Writer Options',
//     null,
//     []];
export default NoOpWriter;
