export const __version__ = '0.14js'

export class TransformSpec {
    constructor(args) {
	this.unknownReferenceResolvers = [];
    }
    
    getTransforms() {
	return []
    }
}

export class Component extends TransformSpec {
}

    
