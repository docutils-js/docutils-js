import publish from '../../src/fn/publisherFn';
import read from '../../src/fn/reader';

test('publish 1', () => {
    publish({ read });
});
