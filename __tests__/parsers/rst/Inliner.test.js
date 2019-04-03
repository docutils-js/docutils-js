import { Inliner } from 'parsers/rst/States'
import { newDocument, newReporter } from 'utils';
import { Element }  from 'nodes';

function setupInliner() {
    const inliner = new Inliner();
    inliner.initCustomizations({})
    const document = newDocument({}, {});
    const reporter = newReporter({}, {});
    let language;
    const memo = { document,
		   reporter,
		   language,
		 };

    return [inliner,memo, document];
}


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
    const [inliner, memo, document] = setupInliner();
    const result = inliner.parse('I like TV.', {  lineno: 1, memo, parent: document });
    const [ nodes] = result;
    expect(nodes.toString()).toMatchSnapshot();
})

test('inliner 2', () => {
    const [inliner, memo, document] = setupInliner();
    const result = inliner.parse('I like *TV*.', {  lineno: 1, memo, parent: document });
    const [ nodes] = result;
    expect(nodes.toString()).toMatchSnapshot();
})

test('pattern 1', () => {
    const [inliner, memo, document] = setupInliner();
    /* do we want to pass parent as document ?? */
    const [ nodes ] = inliner.parse('*wibble* **wobble***', {  lineno: 1, memo, parent: document });
    expect(nodes.toString()).toMatchSnapshot();
})



