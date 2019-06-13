import { document } from './nodes';
import newReporter from './newReporter';
import {Settings} from "../gen/Settings";
import { Document } from "./types";

/* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
const __docformat__ = 'reStructuredText';

/**
 *  Return a new empty document object.
 *
 *  :Parameters:
 *      `source_path` : string
 *          The path to or description of the source text of the document.
 *      `settings` : optparse.Values object
 *          Runtime settings.  If none are provided, a default core set will
 *          be used.  If you will use the document object with any Docutils
 *          components, you must provide their default settings as well.  For
 *          example, if parsing, at least provide the parser settings,
 *          obtainable as follows::
 *
 *              settings = docutils.frontend.OptionParser(
 *                  components=(docutils.parsers.rst.Parser,)
 *                  ).get_default_values()
 * {@link module:nodes~document}
 * @returns {module:nodes~document} New document
 * @see module:newDocument~newDocument
 */
function newDocument(args: { sourcePath: string }, settings: Settings): Document{
    const {sourcePath} = args;
    const reporter = newReporter({ sourcePath }, settings);
    const attrs: { source?: string }= {};
    if (typeof sourcePath !== 'undefined') {
        attrs.source = sourcePath;
    }

    // eslint-disable-next-line new-cap
    const myDocument = new document(settings, reporter, '', [], attrs);
    myDocument.noteSource(sourcePath, -1);
    return myDocument;
}

export { newDocument };

export default newDocument;
