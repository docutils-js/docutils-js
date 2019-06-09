/* eslint-disable-next-line no-unused-vars */
import SettingsSpec from "./SettingsSpec";

const __docformat__ = 'reStructuredText';

/**
 * @class
 * Runtime transform specification base class.
 *
 * TransformSpec subclass objects used by `docutils.transforms.Transformer`.
 */

class TransformSpec extends SettingsSpec {
    public unknownReferenceResolvers: any[] = [];

    /**
     * Get the transforms associated with the instance.
     * @returns {Array} array of Transform classes (not instances)
     */
    // eslint-disable-next-line class-methods-use-this
    getTransforms(): any[] {
        return [];
    }

    toString() {
        return `TransformSpec<${this.constructor.name}>`;
    }
}
export default TransformSpec;
