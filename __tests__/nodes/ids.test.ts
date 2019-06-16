import newDocument from "../../src/newDocument";
import { defaults } from "../../gen/defaults";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const x = require('../../gen/defaults');

test('setID', () => {
    const y = x;
    if(defaults === undefined) {
        throw new Error('need proper defaults');
    }
    const d = newDocument({sourcePath:''}, defaults);
});
