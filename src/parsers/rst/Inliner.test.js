import { Inliner } from './States'
import { newDocument, newReporter } from '../../utils';

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
    console.log(nodes);
})
