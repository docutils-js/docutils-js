import StringList from '../../../StringList';
export const mockGetSourceAndLine = jest.fn(() => (['', 0]));
export const mockGetFirstKnownIndented = jest.fn((args) => ([new StringList(['hello']), args.indent, 0, true]));

const mock = jest.fn().mockImplementation(() => {
    return { getSourceAndLine: mockGetSourceAndLine,
        getFirstKnownIndented: mockGetFirstKnownIndented,
    };
});
export default mock;
