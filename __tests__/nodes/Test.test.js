import { Text } from '../../src/nodes';

test('Text.constructor', () => {
    const text = new Text('my text');
});

test('Text.constructor invalid args', () => {
    expect(() => new Text()).toThrow();
});
