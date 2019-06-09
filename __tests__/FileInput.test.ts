import { FileInput } from '../src/io';

function createFileInput(args: any) {
    let myArgs;
    if (typeof args === 'undefined') {
        myArgs = {
 source: undefined, sourcePath: undefined, encoding: 'utf-8', errorHandler: undefined, autoClose: undefined, mode: undefined,
};
    } else {
        myArgs = args;
    }
    return new FileInput(myArgs);
}

test('FileInput.constructor no-args', () => {
    expect(() => createFileInput({})).toThrow();
});
