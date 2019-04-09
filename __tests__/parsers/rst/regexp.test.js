import Inliner from '../../../src/parsers/rst/Inliner';
import { newDocument, newReporter, isIterable } from '../../../src/utils';
import { Element } from '../../../src/nodes';
import baseSettings from '../../../src/baseSettings';

function testInitialInlinerPattern(text, inliner) {
    if(typeof inliner === 'undefined') {
	inliner = setupInliner();
    }
    const result = inliner.patterns.initial[0].exec(text);
    if(!result) {
	return undefined;
    }
    const rr = {}
    inliner.patterns.initial[1].forEach((x, index) => {
	if (x != null) {
            rr[x] = result[index];
	}
    });
    return { groups: rr,
	     input: text,
	     result,
	     pattern: inliner.patterns.initial[0]
	   };
}

function setupInliner() {
    const inliner = new Inliner();
    inliner.initCustomizations({});
    const document = newDocument({}, baseSettings);
    const reporter = newReporter({}, {});
    let language;
    const memo = { document,
		   reporter,
		   language,
		 };
    return inliner;
}

function processRegexp(definition, text) {
    let [fakeTuple, name, prefix, suffix, parts] = definition;
    let prefixNames = [];
    if (Array.isArray(prefix)) {
        prefix.shift();
        const pr = prefix.shift();
        prefixNames = [...prefix];
        prefix = pr;
    }
    if (suffix === undefined) {
        throw new Error();
    }
    let suffixNames = [];
    if (Array.isArray(suffix)) {
        suffix.shift();
        const sr = suffix.shift();
        suffixNames = [...suffix];
        suffix = sr;
    }

    if (!fakeTuple) {
        throw new Error();
    }
    const pi = isIterable(parts);
//    console.log(`buildRegexp(${name} - ${pi})`);
    const partStrings = [];
//    console.log(parts);
    if (parts === undefined) {
        throw new Error();
    }
    const fakeTuple2 = parts.shift();
    const groupNames = [];
    for (const part of parts) {
        const fakeTuple3 = Array.isArray(part) ? part[0] : undefined;
        if (fakeTuple3 === 1) {
            const [regexp, subGroupNames] = buildRegexp(part, null);
            groupNames.push(...subGroupNames);
            partStrings.push(regexp);
        } else if (fakeTuple3 === 2) {
            part.shift();
            const regexp = part.shift();
            partStrings.push(regexp);
                groupNames.push(...part);
            } else {
                partStrings.push(part);
            }
    }
    const orGroup = partStrings.map(x => `(${x})`).join('|');
    const regexp = `${prefix}(${orGroup})${suffix}`;
//    console.log(new RegExp(regexp))
    groupNames.splice(0, 0, ...prefixNames, name);
    groupNames.push(...suffixNames);
//    console.log('groupnames')
//    console.log(groupNames);
//    console.log(`regexp is ${regexp}`);
    if (compile) {
        return [new RegExp(regexp), groupNames, regexp];
    }

    return [regexp, groupNames];
}

test.each([
    ['interpreted with role prefix', ':hello:`test`'],
    ['interpreted with role suffix', '`test`:hello:'],
    ['emphasis surrounded by text', 'hello *and* goodbye'],
])("%s", (a, b) => {

    const results = testInitialInlinerPattern(b);
    expect(results.groups).toMatchSnapshot();
});
