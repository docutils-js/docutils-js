import { parse } from '../src/index';

test('parse misc doc', () => {
//    expect(parse('* hello\n*test\n\nButter\n======\n\n    I am a test.\n')).toMatchSnapshot();
    let result = parse(`Test
====

Poof
----

\`Hello\`


`);
    result.uuid = undefined;
    expect(result).toMatchSnapshot();
});
