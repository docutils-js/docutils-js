import Inliner from '../../../src/parsers/rst/Inliner';
import { newReporter } from '../../../src/utils';
import newDocument from '../../../src/newDocument';
import { Element } from '../../../src/nodes';
import baseSettings from '../../../src/baseSettings';

const currentLogLines = [];

afterEach(() => {
    if(currentLogLines.length) {
	currentLogLines.map(line => console.log(line));
	currentLogLines.length = 0;
    }
});

function isIterable(obj) {
  // checks for null and undefined
  if (obj == null) {
    return false;
  }
  return typeof obj[Symbol.iterator] === 'function';
}

function dumpNodes(nodes) {
    for (const node in nodes) {
	if (Array.isArray(node)) {
	    dumpNodes(node);
	    continue;
	}
	console.log(node.tagname);
	dumpNodes(nodes.children);
    }
}

test('inliner 1', () => {
    const inliner = new Inliner();
    inliner.initCustomizations({});
    const document = newDocument({}, { ... baseSettings });
    const reporter = newReporter({}, { ...baseSettings });
    let language;
    const memo = {
	document,
	reporter,
	language,
    };

    const result = inliner.parse('`test`:foo:', { lineno: 1, memo, parent: document });
    const [nodes, messages] = result;
    const stringRep = nodes.map(n => n.toString()).join('');
    expect(stringRep).toMatchSnapshot();
    expect(messages.map(n => n.toString()).join('')).toMatchSnapshot();
});

test.each([['Interpreted text', '`test`:foo:'],
	   ['Emphasis', 'I like *TV*'],
	   ['Bold', 'Eat **lots** of *food*.'],
	   ['Literal', '``literal``'],
	   ['Not sure', '_`hello`'],
	   ['Interpreted text, no specified role', '`test`'],
	  ])('%s', (testName, a) => {
    const inliner = new Inliner();
    inliner.initCustomizations({});
	      const document = newDocument({}, { ...baseSettings });
	      const reporter = newReporter({}, { ...baseSettings });
    let language;
    const memo = {
 document,
		   reporter,
		   language,
		 };

    const result = inliner.parse(a, { lineno: 1, memo, parent: document });
    const [nodes, messages] = result;
    const stringRep = nodes.map(n => n.toString()).join('');
	      expect(stringRep).toMatchSnapshot();
    expect(messages.map(n => n.toString()).join('')).toMatchSnapshot();
});

/*
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
*/
