export default class Transformer {
    constructor(document) {
        this.transforms = [];
        this.unknownReferenceResolvers = [];
        this.document = document;
        this.applied = [];
        this.sorted = 0;
        this.components = {};
        this.serialno = 0;
    }

    populateFromComponents(...components) {
	for(let component of components) {
	    if(!component) {
		continue;
	    }
	    console.log(`processing ${component.toString()} ${component.componentType}`);
	    const transforms = component.getTransforms() || [];
	    if(transforms.filter(x => typeof x === 'undefined').length !== 0){
		throw new Error(`got invalid transform from ${component}`);
	    }
	    
	    this.addTransforms(transforms);
	    this.components[component.componentType] = component
	}
	this.sorted = 0
	const urr = []
	for( let i of components ) {
	    if(typeof i !== 'undefined'){
//		console.log(`collecting unknownReferenceResolver from component ${i}`);
		if(i.unknownReferenceResolvers) {
		    urr.push(i.unknownReferenceResolvers);
		}
	    } else {
//		console.log('component is undefined. fixme');
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
	this.document.reporter.attachObserver(this.document.noteTransformMessage.bind(this.document));
	while(this.transforms.length) {
	    if(!this.sorted) {
		this.transforms.sort();
		this.transforms.reverse();
		this.sorted = 1;
	    }
	    const t = this.transforms.pop();
	    console.log(t);
	    const [ priority, TransformClass, pending, kwargs ] = t;
	    try {
		const transform = new TransformClass(this.document, { startnode: pending });
		transform.apply(kwargs);
	    } catch(error) {
		throw new Error(`failure ${TransformClass}.`);
	    }
	    this.applied.push([priority, TransformClass, pending, kwargs]);
	}
    }

    addTransforms(transformList) {
        //"""Store multiple transforms, with default priorities."""
	transformList.forEach(transform_class => {
	    if(!transform_class) {
		throw new Error("invalid argument");
	    }
            const priority_string = this.get_priority_string(
                transform_class, 'defaultPriority')
	    console.log(`priority string is ${priority_string}`);
	    console.log(`I have ${transform_class}`);
            this.transforms.push(
                [priority_string, transform_class, null, {}])
            this.sorted = 0
	});
    }

    get_priority_string(class_, priority) {
        /*"""
        Return a string, `priority` combined with `self.serialno`.

        This ensures FIFO order on transforms with identical priority.
        """*/
	if(typeof class_ === 'undefined') {
	    throw new Error('undefined');
	}
	
        this.serialno += 1
	const p = class_[priority];
        return `${p}-${this.serialno}`;//fixme %03d-%03d' % (priority, self.serialno)
    }
}
