import unescape from '../../src/utils/unescape';

test('unescape with string arg requiring no escaping', () => {
    expect(unescape('hello')).toBe('hello');
});

test('unescape with null-space', () => {
    expect(unescape('\x00 foo')).toBe('foo');
});

test('unescape with null-NL', () => {
    expect(unescape('\x00\nfoo')).toBe('foo');
});

test('unescape with null', () => {
    expect(unescape('\x00foo')).toBe('foo');
});

test('unescape with null', () => {
    expect(unescape('\x00foo')).toBe('foo');
});
