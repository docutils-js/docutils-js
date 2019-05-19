import { string2lines } from '../src/StateMachine';
import StringList from '../src/StringList';

// from https://gist.github.com/hu9o/f4e80ed4b036fd76c31ef33dc5b32601
// Cartesian product of arrays
// @takes N arrays -- arguments *must* be arrays
// @returns an array of X arrays of N elements, X being the product of the input arrays' lengths.

/* eslint-disable-next-line no-unused-vars */
function cartesianProduct(...arrays) {
        function _inner(...args) {
                if (arguments.length > 1) {
                        const arr2 = args.pop(); // arr of arrs of elems
                        const arr1 = args.pop(); // arr of elems
                        return _inner(...args,
                                arr1.map(e1 => arr2.map(e2 => [e1, ...e2]))
                                    .reduce((arr, e) => arr.concat(e), []));
                }
                        return args[0];
        }
        return _inner(...arrays, [[]]);
}
/* trimLeft
getTextBlock
getIndented
get2dBlock
padDoubleWidth
replace
trimTop (renamed ?)

viewlist: splice, slice, info, trimStart, trimEnd

*/

const testLines = [['test\n123\nlalala\n']];
const lineArray = testLines.map((lines, index) => [index.toString(),
                                               new StringList(string2lines(lines[0]))]);

test.each(lineArray)('%s', (index, lines) => {
    const s = lines.slice(0, lines.length);
    expect(s).toMatchSnapshot();
    s.trimLeft(3);
    expect(s).toMatchSnapshot();
    s.trimTop();
    expect(s).toMatchSnapshot();
    s.trimTop(2);
    expect(s).toHaveLength(0);
});

test.each(lineArray)('%s splice', (index, lines) => {
    const s = lines.slice(0, lines.length);
    expect(s).toMatchSnapshot('original');
    expect(s.splice(0, 1)).toMatchSnapshot('splice return');
    expect(s).toMatchSnapshot('final');
});

test('constructor', () => {
    const s = new StringList(['a', 'b'], 'source');
    expect(s.items).toMatchSnapshot();
});

test('constructor with parent', () => {
    const s = new StringList(['a', 'b'], 'source');
    const child = new StringList(s, 'source', undefined, s, 0);
    expect(s.items).toMatchSnapshot();
    expect(child).toMatchSnapshot();
    expect(child.parent).toBe(s);
});

test('constructor with parent, disconnect child', () => {
    const s = new StringList(['a', 'b'], 'source');
    const child = new StringList(s, 'source', undefined, s, 0);
    expect(child.parent).toBe(s);
    child.disconnect();
    expect(child.parent).toBeUndefined();
});
