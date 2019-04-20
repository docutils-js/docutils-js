class TransformSpec {
    constructor(args) {
        this.unknownReferenceResolvers = [];
	this._init(args);
    }

    _init(...args) {
    }

    getTransforms() {
        return [];
    }

    toString() {
        return `TransformSpec<${this.constructor.name}>`;
    }
}
export default TransformSpec;
