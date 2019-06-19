import { newDocument } from '../../src/newDocument'
import { defaults } from '../../gen/defaults';
import { nodes } from "../../src";

test('1', () => {
    const document = newDocument({sourcePath: '<test>'}, defaults);
    document.children.push(new nodes.section('', [new nodes.paragraph('', 'derp')]))
});
