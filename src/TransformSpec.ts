import {ITransformSpec} from "./types";

/* eslint-disable-next-line no-unused-vars */
const __docformat__ = 'reStructuredText';

/**
 * @class
 * Runtime transform specification base class.
 *
 * TransformSpec subclass objects used by `docutils.transforms.Transformer`.
 */

class TransformSpec implements ITransformSpec {
    constructor(args) {
        this.unknownReferenceResolvers = [];
        this._init(args);
    }

    /* eslint-disable-next-line no-unused-vars */
    _init(...args) {
    }

    /**
     * Get the transforms associated with the instance.
     * @returns {Array} array of Transform classes (not instances)
     */
    getTransforms() {
        return [];
    }

    toString() {
        return `TransformSpec<${this.constructor.name}>`;
    }

    unknownReferenceResolvers: any[];
}
export default TransformSpec;
