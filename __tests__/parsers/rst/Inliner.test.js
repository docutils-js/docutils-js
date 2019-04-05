import { Inliner } from '../../../src/parsers/rst/States'
import { newDocument, newReporter } from '../../../src/utils';
import { Element }  from '../../../src/nodes';

function isIterable(obj) {
  // checks for null and undefined
  if (obj == null) {
    return false;
  }
  return typeof obj[Symbol.iterator] === 'function';
}

function dumpNodes(nodes) {
    for(let node in nodes) {
	if(Array.isArray(node)) {
	    dumpNodes(node);
	    continue;
	}
	console.log(node.tagname);
	dumpNodes(nodes.children);
    }
}

test('inliner 1', () => {
    const inliner = new Inliner();
    inliner.initCustomizations({})
    const document = newDocument({}, {});
    const reporter = newReporter({}, {});
    let language;
    const memo = { document,
		   reporter,
		   language,
		 };
		   
    const result = inliner.parse('I like TV.', {  lineno: 1, memo, parent: document });
    const [ nodes] = result;
    console.log(nodes);
})

test('inliner 2', () => {
    const inliner = new Inliner();
    inliner.initCustomizations({})
    const document = newDocument({}, {});
    const reporter = newReporter({}, {});
    let language;
    const memo = { document,
		   reporter,
		   language,
		 };
		   
    const result = inliner.parse('I like *TV*.', {  lineno: 1, memo, parent: document });
    const [ nodes] = result;
    if(isIterable(nodes)) {
	console.log('is iterable');
	nodes.forEach((e, i) => {
	    if(typeof e === 'object' && e instanceof Element) {
		console.log(e.tagname);
	    } else if(Array.isArray(e)) {
		e.forEach((e2, i2) => {
		    if(e2 instanceof Element) {
			console.log(e.tagname);
		    } else {
			console.log(`    ${i2}: ${e2}`);
		    }
		    
		})
	    } else {
		console.log(`${i}: ${e}`);
	    }
	});

    }

})
