class TransformSpec {
    constructor(args) {
        this.unknownReferenceResolvers = [];
    }

    getTransforms() {
        return [];
    }

    toString() {
        return `TransformSpec<${this.constructor.name}>`;
    }
}
export default TransformSpec;
