import * as utils from '../src/utils';
import unescape from '../src/utils/unescape';
import baseSettings from '../src/baseSettings';
import Reporter from '../src/Reporter';
import newReporter from '../src/newReporter';

function createReporter() {
    return new Reporter(undefined, 0, 4, undefined, true, 'utf-8');
}

test('1', () => {
    const r = newReporter({}, { ...baseSettings });

//    r.attachObserver(node => {
//	console.log(node.children[0].children[0].astext());
//    })
    r.debug('hello');
});

test('2', () => {
    expect(unescape('d\x00 e\x00\nrp')).toBe('derp');
});

test('findCombiningChars', () => {
    expect(utils.findCombiningChars('A t̆ab̆lĕ')).toEqual([3, 6, 9]);
});
test('columnIndicies', () => {
    expect(utils.columnIndicies('A t̆ab̆lĕ')).toEqual([0, 1, 2, 4, 5, 7, 8]);
});

test('isIterable with null or undefined value', () => {
    expect(utils.isIterable()).toBe(false);
});

test('Reporter.systemMessage with Error/Exception', () => {
    const reporter = createReporter();
    reporter.systemMessage(reporter.WARNING_LEVEL, new Error('my error'), [], {});
});
