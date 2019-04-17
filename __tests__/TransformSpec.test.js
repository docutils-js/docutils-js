import TransformSpec from '../src/TransformSpec';

test('TransformSpec.toString()', () => {
    const ts = new TransformSpec();
    expect(ts.toString()).toEqual('TransformSpec<TransformSpec>');
});
