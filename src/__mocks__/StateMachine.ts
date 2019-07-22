export const mockGetSourceAndLine = jest.fn(() => (['', 0]));

const mock = jest.fn().mockImplementation(() => {
    return { getSourceAndLine: mockGetSourceAndLine };
});
export { mock as StateMachine };
