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
	    if(typeof i !== 'undefined'){
		console.log(`collecting unknownReferenceResolver from component ${i}`);
		if(i.unknownReferenceResolvers) {
		    urr.push(i.unknownReferenceResolvers);
		}
	    } else {
		console.log('component is undefined. fixme');
	    }
	}
//	console.log('urr is ')
	//	console.log(urr);
	for (const f of urr) {
	    if(typeof f === 'undefined') {
		throw new ApplicationError('Unexpected undefined value in ist of unknown reference resolvers');
	    }
	}
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
