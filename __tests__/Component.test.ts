import Component from '../src/Component';
import { createLogger} from'../src/testUtils';

test('Component.toString()', () => {
    const c = new Component({logger: createLogger()});
    expect(c.toString()).toEqual('Component<Component>');
});
