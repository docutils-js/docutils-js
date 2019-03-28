export default class Transformer {
    constructor(document) {
	this.transforms = []
	this.unknownReferenceResolvers = []
	this.document = document;
	this.applied = []
	this.sorted = 0
	this.components = {}
	this.serialno = 0
    }
	
    populateFromComponents(...components) {
	for(let component of components) {
	    if(!component) {
		continue;
	    }
	    this.addTransforms(component.getTransforms())
	    this.components[component.componentType] = component
	}
	this.sorted = 0
	const urr = []
	for( let i of components ) {
	    console.log(i);
	    urr.push(i.unknownReferenceResolvers);
	}
	console.log('urr is ')
	console.log(urr);
	const decoratedList = urr.map(f => [f.priority, f]);
	decoratedList.sort()
	this.unknownReferenceResolvers.push(...decoratedList.map(f => f[1]));
    }
    applyTransforms() {
//	throw new Error("poo")
    }

    addTransforms() {
    }
}
