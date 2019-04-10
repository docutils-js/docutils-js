import TransformSpec from './TransformSpec';

class Component extends TransformSpec {
    toString() {
	return `Component<${this.constructor.name}>`;
    }
}


export default Component;
