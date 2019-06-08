import { Element } from '../../src/nodes';

class MyElement extends Element { }

test('subclassed Element-constructor', () => {
    const element = new MyElement('', [], {});
    expect(element).toBeDefined();
});

test('subclassed Element-starttag', () => {
    const element = new MyElement('', [], {});
    expect(element.starttag()).toEqual('<MyElement>');
});
