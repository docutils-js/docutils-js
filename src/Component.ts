import TransformSpec from './TransformSpec';
import { LoggerType } from './types';

/* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
const __docformat__ = 'reStructuredText';

/**
 * Base class for docutils components.
 * Extends TransformSpec, which itself extends SettingsSpec. Thus all
 * docutils components inherit numerous properties and "capabilities"
 * from this inheritance chain. All should probably be combined into
 * a single class since nothing is gained from having the inheritance
 * hierarchy.
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