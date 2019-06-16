import { newDocument } from '../../src/newDocument'
import { defaults } from '../../gen/defaults';

test('1', () => {
    const doument = newDocument({sourcePath: '<test>'}, defaults);
});
