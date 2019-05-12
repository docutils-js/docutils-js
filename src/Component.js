import TransformSpec from './TransformSpec';

const __docformat__ = 'reStructuredText';

/**
 * Base class for docutils components.
 * @extends TransformSpec
 */
class Component extends TransformSpec {
    toString() {
        return `Component<${this.constructor.name}>`;
    }
}


export default Component;
