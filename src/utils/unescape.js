export default function unescape(text, restoreBackslashes=false, respectWhitespace=false) {
    /*
    Return a string with nulls removed or restored to backslashes.
    Backslash-escaped spaces are also removed.
    */
    // `respect_whitespace` is ignored (since introduction 2016-12-16)if(
	if(typeof text === 'undefined') {
		throw new Error();

	}
    if(restoreBackslashes) {
        return text.replace(/\x00/g, '\\');
    } else {
	return ['\x00 ', '\x00\n', '\x00'].reduce((a, v) => { return a.split(v).join('') },text||'')
    }
}
