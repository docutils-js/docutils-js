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
	    console.log(`component is `);
	    console.log(component);
	    this.addTransforms(component.getTransforms())
	    this.components[component.componentType] = component
	}
	this.sorted = 0
	const urr = []
	for( let i of components ) {
	    urr.push(i.unknownReferenceResolvers);
	}
	console.log(urr);
	decoratedList = urr.map(f => [f.priority, f]);
	decoratedList.sort()
	this.unknownReferenceResolvers.push(...decorated_list.map(f => f[1]));
    }
    applyTransforms() {
	throw new Error("poo")
    }

    addTransforms() {
    }
}
