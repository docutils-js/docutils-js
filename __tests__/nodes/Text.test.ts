import { Text } from '../../src/nodes';

test('Text.constructor', () => {
    const text = new Text('my text');
    expect(text).toBeDefined();
});

test('Text.constructor invalid args', () => {
    expect(() => new Text('')).toThrow();
});
