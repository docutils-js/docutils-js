import Inliner from '../../../src/parsers/rst/Inliner';
import newReporter from '../../../src/newReporter';
import newDocument from '../../../src/newDocument';
import baseSettings from '../../../src/baseSettings';

function setupInliner() {
    const inliner = new Inliner();
    inliner.initCustomizations({});
    const document = newDocument({}, { ...baseSettings });
    const reporter = newReporter({}, { ...baseSettings });
    let language;
    /* eslint-disable-next-line no-unused-vars */
    const memo = {
 document,
                   reporter,
                   language,
                 };
    return inliner;
}

function testInitialInlinerPattern(text, inliner) {
    if (typeof inliner === 'undefined') {
        inliner = setupInliner();
    }
    const result = inliner.patterns.initial[0].exec(text);
    if (!result) {
        return undefined;
    }
    const rr = {};
    inliner.patterns.initial[1].forEach((x, index) => {
        if (x != null) {
            rr[x] = result[index];
        }
    });
    return {
 groups: rr,
             input: text,
             result,
             pattern: inliner.patterns.initial[0],
           };
}

test.each([
    ['interpreted with role prefix', ':hello:`test`'],
    ['interpreted with role suffix', '`test`:hello:'],
    ['emphasis surrounded by text', 'hello *and* goodbye'],
])('%s', (a, b) => {
    const results = testInitialInlinerPattern(b);
    expect(results.groups).toMatchSnapshot();
});
