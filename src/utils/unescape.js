export default function unescape(text, restoreBackslashes = false, respectWhitespace = false) {
    /*
    Return a string with nulls removed or restored to backslashes.
    Backslash-escaped spaces are also removed.
    */
    // `respect_whitespace` is ignored (since introduction 2016-12-16)if(
    if (typeof text === 'undefined') {
        throw new Error();
    }
    if (typeof text.split !== 'function') {
        throw new Error();
    }

    if (restoreBackslashes) {
        return text.replace(/\\x00/g, '\\');
    }
        return ['\x00 ', '\x00\n', '\x00'].reduce((a, v) => a.split(v).join(''), text || '');
}
