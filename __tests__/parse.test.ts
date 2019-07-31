import { parse } from '../src/index';
import { nodeToXml } from "../src/nodeUtils";
import { createLogger} from '../src/testUtils';

test('parse misc doc', () => {
//    expect(parse('* hello\n*test\n\nButter\n======\n\n    I am a test.\n')).toMatchSnapshot();
    let result = parse(`Test
====

Poof
----

\`Hello\`


`, createLogger());
    const document = result;
    expect(document).toBeDefined();
    expect(document.getNumChildren()).toBe(3);
    expect(nodeToXml(result)).toMatchSnapshot();
});
