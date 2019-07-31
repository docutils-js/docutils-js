import { newDocument } from '../../src/newDocument'
import { nodes, NodeInterface, getDefaultSettings, Document } from "../../src";
import { createNewDocument } from '../../src/testUtils';

class TestVisitor extends nodes.SparseNodeVisitor {
    public constructor(document: Document) {
        super(document);
        this.strictVisitor = false;
    }

    public default_visit(node: NodeInterface) {
        console.log(`default_visit ${node}`);
    }
    public default_departure(node: NodeInterface) {
        console.log(`default_departure ${node}`);
    }
}


test('1', () => {
    const document = createNewDocument();
    document.add(new nodes.section('', [new nodes.paragraph('', 'derp')]))
    const tv  = new TestVisitor(document);
    document.walkabout(tv);
});
