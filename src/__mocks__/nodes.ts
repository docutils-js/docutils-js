export const mockNoteCitation = jest.fn();
// @ts=ignore
const nodes = jest.requireActual('../nodes');

const mockDocument = jest.fn().mockImplementation(() => {
    return { noteCitation: mockNoteCitation };
});
nodes.document = mockDocument;

