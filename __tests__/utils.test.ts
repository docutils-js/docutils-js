import * as utils from '../src/utils';
import unescape from '../src/utils/unescape';
import Reporter from '../src/Reporter';
import newReporter from '../src/newReporter';
import { getDefaultSettings } from "../src/settingsHelper";
import { LogLevel } from "../src/types";


test('1', () => {
    const r = newReporter({sourcePath:''}, { ...getDefaultSettings() });

    //    r.attachObserver(node => {
    //      console.log(node.children[0].children[0].astext());
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
    expect(utils.isIterable(undefined)).toBe(false);
});

test('Reporter.systemMessage with Error/Exception', () => {
    const reporter = newReporter({sourcePath:''}, getDefaultSettings());
    reporter.systemMessage(LogLevel.WarningLevel, new Error('my error'), [], {});
});
