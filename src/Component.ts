import TransformSpec from './TransformSpec';

/* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
const __docformat__ = 'reStructuredText';

/**
 * Base class for docutils components.
 * @extends TransformSpec
 */
class Component extends TransformSpec {
    public supported: string[] = [];
    public componentType: string = 'random';
    public toString(): string {
        return `Component<${this.constructor.name}>`;
    }
}


export default Component;
