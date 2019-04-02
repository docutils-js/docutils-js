export const mockMyMock = jest.fn()
const mock = jest.fn().mockImplementation(() => {
    return { randomFunc: mockMyMock };
});

export default mock;
