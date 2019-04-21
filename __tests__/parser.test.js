import parser from '../src/index';

test('parse misc doc', () => {
    expect(parser.parse(`* hello\n*test\n\nButter\n======\n\n    I am a test.\n`)).toMatchSnapshot();
});
