import leftPad from 'left-pad';

/**
 * Transformer class responsible for transforming document output
 */
class Transformer {
    /**
     * Create transformer class
     * @param {nodes.document} document - document to transform
     */
    constructor(document) {
        this.transforms = [];
        this.unknownReferenceResolvers = [];
        this.document = document;
        this.applied = [];
        this.sorted = 0;
        this.components = {};
        this.serialno = 0;
    }

    /**
     * populateFromComponents
     *
     */
    populateFromComponents(...components) {
        for (const component of components) {
            if (!component) {
                continue;
            }
//          console.log(`processing ${component.toString()} ${component.componentType}`);
            const transforms = component.getTransforms() || [];
	    transforms.forEach((t) => {
		if (typeof t === 'undefined') {
                    throw new Error(`got invalid transform from ${component}`);
		}
	    });

            if (transforms.filter(x => typeof x === 'undefined').length !== 0) {
                throw new Error(`got invalid transform from ${component}`);
            }

            this.addTransforms(transforms);
            this.components[component.componentType] = component;
        }
        this.sorted = 0;
        const urr = [];
        for (const i of components) {
            if (typeof i !== 'undefined') {
//              console.log(`collecting unknownReferenceResolver from component ${i}`);
                if (i.unknownReferenceResolvers) {
                    urr.push(i.unknownReferenceResolvers);
                }
            } else {
//              console.log('component is undefined. fixme');
            }
        }
//      console.log('urr is ')
        //      console.log(urr);
        for (const f of urr) {
            if (typeof f === 'undefined') {
                throw new ApplicationError('Unexpected undefined value in ist of unknown reference resolvers');
            }
        }
        const decoratedList = urr.map(f => [f.priority, f]);
        decoratedList.sort();
        this.unknownReferenceResolvers.push(...decoratedList.map(f => f[1]));
    }

    /**
     * apply the transforms
     */
    applyTransforms() {
        this.document.reporter.attachObserver(this.document.noteTransformMessage.bind(this.document));
        while (this.transforms.length) {
            if (!this.sorted) {
                this.transforms.sort((el1, el2) => {
                    if (el1[0] < el2[0]) {
                        return -1;
                    }
                    if (el1[0] > el2[0]) {
                        return 1;
                    }
                    return 0;
                });
                this.transforms.reverse();
                this.sorted = 1;
            }
            const t = this.transforms.pop();
//          console.log(t);
            const [priority, TransformClass, pending, kwargs] = t;
            try {
                const transform = new TransformClass(this.document, { startnode: pending });
                transform.apply(kwargs);
            } catch (error) {
                throw error;
            }
            this.applied.push([priority, TransformClass, pending, kwargs]);
        }
    }

    /**
     * addTransforms
     * @param {Array} transformList - Array of transform classes (not instances).
     */
    addTransforms(transformList) {
        // """Store multiple transforms, with default priorities."""
        transformList.forEach((transform_class) => {
            if (!transform_class) {
                throw new Error('invalid argument');
            }
            const priority_string = this.getPriorityString(
                transform_class, 'defaultPriority',
);
//          console.log(`priority string is ${priority_string}`);
//          console.log(`I have ${transform_class}`);
            this.transforms.push(
                [priority_string, transform_class, null, {}],
);
            this.sorted = 0;
        });
    }

    /**
     *
     * Return a string, `priority` combined with `self.serialno`.
     *
     * This ensures FIFO order on transforms with identical priority.
     */
    getPriorityString(class_, priority) {
        if (typeof class_ === 'undefined') {
            throw new Error('undefined');
        }

        this.serialno += 1;
        const p = class_[priority];
        return `${leftPad(p, 3, '0')}-${leftPad(this.serialno, 3, '0')}`;
    }
}

export default Transformer;
