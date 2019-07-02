import { Text } from '../../src/nodes';

test('Text.constructor', () => {
    const text = new Text('my text');
    expect(text).toBeDefined();
});

test('Text.constructor no text', () => {
    expect(() => new Text('')).toBeDefined();
});
