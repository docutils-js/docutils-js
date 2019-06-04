import { IComponent } from './types';
import TransformSpec from './TransformSpec';

/* eslint-disable-next-line no-unused-vars */
const __docformat__ = 'reStructuredText';

/**
 * Base class for docutils components.
 * @extends TransformSpec
 */
abstract class Component extends TransformSpec implements IComponent {
    protected componentType: string;
    protected supported: string[];

    supports(format: string): boolean {
        return false;
    }
    toString() {
        return `Component<${this.constructor.name}>`;
    }

}


export default Component;
