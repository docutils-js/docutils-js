const __docformat__ = 'reStructuredText';

/**
 * @class
 * Runtime transform specification base class.
 *
 * TransformSpec subclass objects used by `docutils.transforms.Transformer`.
 */

class TransformSpec {
    constructor(args) {
        this.unknownReferenceResolvers = [];
	this._init(args);
    }

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
}
export default TransformSpec;
