import Component from '../src/Component';

test('Component.toString()', () => {
    const c = new Component();
    expect(c.toString()).toEqual('Component<Component>');
});
