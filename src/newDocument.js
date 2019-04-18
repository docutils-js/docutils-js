import { document } from './nodes';
import newReporter from './newReporter';

export default function newDocument({ sourcePath }, settings) {
    const reporter = newReporter({ sourcePath }, settings);
    const attrs = {};
    if (typeof sourcePath !== 'undefined') {
        attrs.source = sourcePath;
    }

    const myDocument = new document(settings, reporter, '', [], attrs);
    myDocument.noteSource(sourcePath, -1);
    return myDocument;
}
