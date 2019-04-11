import { StringList, string2lines } from '../src/StateMachine';

/*trimLeft
getTextBlock
getIndented
get2dBlock
padDoubleWidth
replace
trimTop (renamed ?)

viewlist: splice, slice, info, trimStart, trimEnd

*/

test.each([['x', "test\n123\nlalala\n"]])('%s trimLeft', (desc, lines) => {
    const s = new StringList(string2lines(lines));
    expect(s).toMatchSnapshot();
    s.trimLeft(3);
    expect(s).toMatchSnapshot();
    s.trimTop();
    expect(s).toMatchSnapshot();
    s.trimTop(2);
    expect(s).toHaveLength(0);
});
