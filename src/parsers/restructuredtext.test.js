import { Parser } from './restructuredtext';
import { newDocument } from '../utils'

test('1', () => {
    const p = new Parser({});
    const document = newDocument({sourcePath: '' }, {})
    p.parse(`* a bullet point`, document);
    expect( document.toString()).toMatchSnapshot()
});

    
