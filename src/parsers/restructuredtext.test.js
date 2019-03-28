import { Parser } from './restructuredtext';
import { newDocument } from '../utils'

test('1', () => {
    const p = new Parser({});
    p.parse('poop', newDocument({sourcePath: '' }, {}));
    
});

    
