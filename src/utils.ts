import { combining } from './utils/combining';
import {Settings} from "../gen/Settings";
import {Document} from "./types";

/** Return indices of all combining chars in  Unicode string `text`.

    >>> from docutils.utils import find_combining_chars
    >>> find_combining_chars(u'A t ab le ')
    [3, 6, 9]

    */
function findCombiningChars(text: string) {
    return text.split('').map((c, i) => {
        // @ts-ignore
        const r = combining[text.codePointAt(i)];
        return [r, i];
        /* eslint-disable-next-line no-unused-vars */
    }).filter(([r, i]) => r).map(([r, i]) => i);
}


    /*
    Return whether or not to trim footnote space.

    If trim_footnote_reference_space is not None, return it.

    If trim_footnote_reference_space is None, return False unless the
    footnote reference style is 'superscript'.
    */
/* eslint-disable-next-line no-unused-vars */
export function getTrimFootnoteRefSpace(settings: Settings) { // fixme
    return false;
}
/*
    if settings.trim_footnote_reference_space is None:
        return hasattr(settings, 'footnote_references') and \
               settings.footnote_references == 'superscript'
    else:
        return settings.trim_footnote_reference_space
*/

function columnWidth(text: string) { // fixme
    return text.length;
}
export function isIterable(obj: any) {
    // checks for null and undefined
    /* instanbul ignore if */
  if (obj == null) {
    return false;
  }
  return typeof obj[Symbol.iterator] === 'function';
}
/* eslint-disable-next-line camelcase */
export const punctuation_chars = {
    openers: '"\\\'(<\\\\[{\\u0f3a\\u0f3c\\u169b\\u2045\\u207d\\u208d\\u2329\\u2768'
           + '\\u276a\\u276c\\u276e\\u2770\\u2772\\u2774\\u27c5\\u27e6\\u27e8\\u27ea'
           + '\\u27ec\\u27ee\\u2983\\u2985\\u2987\\u2989\\u298b\\u298d\\u298f\\u2991'
           + '\\u2993\\u2995\\u2997\\u29d8\\u29da\\u29fc\\u2e22\\u2e24\\u2e26\\u2e28'
           + '\\u3008\\u300a\\u300c\\u300e\\u3010\\u3014\\u3016\\u3018\\u301a\\u301d'
           + '\\u301d\\ufd3e\\ufe17\\ufe35\\ufe37\\ufe39\\ufe3b\\ufe3d\\ufe3f\\ufe41'
           + '\\ufe43\\ufe47\\ufe59\\ufe5b\\ufe5d\\uff08\\uff3b\\uff5b\\uff5f\\uff62'
           + '\\xab\\u2018\\u201c\\u2039\\u2e02\\u2e04\\u2e09\\u2e0c\\u2e1c\\u2e20'
           + '\\u201a\\u201e\\xbb\\u2019\\u201d\\u203a\\u2e03\\u2e05\\u2e0a\\u2e0d'
        + '\\u2e1d\\u2e21\\u201b\\u201f',
    closers: '"\\\')>\\\\]}\\u0f3b\\u0f3d\\u169c\\u2046\\u207e\\u208e\\u232a\\u2769'
               + '\\u276b\\u276d\\u276f\\u2771\\u2773\\u2775\\u27c6\\u27e7\\u27e9\\u27eb'
               + '\\u27ed\\u27ef\\u2984\\u2986\\u2988\\u298a\\u298c\\u298e\\u2990\\u2992'
               + '\\u2994\\u2996\\u2998\\u29d9\\u29db\\u29fd\\u2e23\\u2e25\\u2e27\\u2e29'
               + '\\u3009\\u300b\\u300d\\u300f\\u3011\\u3015\\u3017\\u3019\\u301b\\u301e'
               + '\\u301f\\ufd3f\\ufe18\\ufe36\\ufe38\\ufe3a\\ufe3c\\ufe3e\\ufe40\\ufe42'
               + '\\ufe44\\ufe48\\ufe5a\\ufe5c\\ufe5e\\uff09\\uff3d\\uff5d\\uff60\\uff63'
               + '\\xbb\\u2019\\u201d\\u203a\\u2e03\\u2e05\\u2e0a\\u2e0d\\u2e1d\\u2e21'
               + '\\u201b\\u201f\\xab\\u2018\\u201c\\u2039\\u2e02\\u2e04\\u2e09\\u2e0c'
        + '\\u2e1c\\u2e20\\u201a\\u201e',
};



/* Return a string with escape-backslashes converted to nulls. */
function escape2null(text: string) {
    const parts = [];
    let start = 0;
    /* eslint-disable-next-line no-constant-condition */
    while (true) {
        const found = text.indexOf('\\', start);
        if (found === -1) {
            parts.push(text.substring(start));
            return parts.join('');
        }
        parts.push(text.substring(start, found));
        parts.push(`\x00${text.substring(found + 1, found + 2)}`);
        start = found + 2; // skip character after escape
    }
}


    /**
    Split `text` on escaped whitespace (null+space or null+newline).
    Return a list of strings.
     */
function splitEscapedWhitespace(text: string) {
    const strings = text.split('\x00 ');
    const s = [];
    /* eslint-disable-next-line no-restricted-syntax */
    for (const string of strings) {
        s.push(...string.split('\x00\n'));
    }
    return s;
}

/**
    Indices of Unicode string `text` when skipping combining characters.

    >>> from docutils.utils import column_indices
    >>> column_indices(u'A t ab le ')
    [0, 1, 2, 4, 5, 7, 8] */
function columnIndicies(text: string) {
    const stringIndicies = new Array(text.length);
    for (let i = 0; i < text.length; i += 1) {
        stringIndicies[i] = i;
    }
    findCombiningChars(text).forEach((index) => {
        stringIndicies[index] = undefined;
    });

    return stringIndicies.filter(i => typeof i !== 'undefined');
}

    // TODO: account for asian wide chars here instead of using dummy
    // replacements in the tableparser?
/*    string_indices = range(len(text))
    findCombiningChars(text).forEach((index) => {
        string_indices[index] = undefined;
    });
    return [i for i in string_indices if i is not None]
}
*/
export function escapeRegExp(strVal: string) {
  return strVal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

// export default {
//    newDocument,
// };
export function stripCombiningChars(text: string) {
    return text;// fixme
    // return u''.join([c for c in text if not unicodedata.combining(c)])
}
export function pySplit(text: string) {
    return text.trim().split(/s+/);
}

export function checkDocumentArg(document: Document) {
    if (typeof document === 'undefined') {
        throw new Error('undefined document');
    }
    return true;
}
export function relativePath(source: string, target: string) {
/*
    Build and return a path to `target`, relative to `source` (both files).

    If there is no common prefix, return the absolute path to `target`.
*/
    return `${source}/${target}`; // fixme broken url
/*    source_parts = os.path.abspath(source or type(target)('dummy_file')
                                  ).split(os.sep)
    target_parts = os.path.abspath(target).split(os.sep)
    # Check first 2 parts because '/dir'.split('/') == ['', 'dir']:
    if source_parts[:2] != target_parts[:2]:
        # Nothing in common between paths.
        # Return absolute path, using '/' for URLs:
        return '/'.join(target_parts)
    source_parts.reverse()
    target_parts.reverse()
    while (source_parts and target_parts
           and source_parts[-1] == target_parts[-1]):
        # Remove path components in common:
        source_parts.pop()
        target_parts.pop()
    target_parts.reverse()
    parts = ['..'] * (len(source_parts) - 1) + target_parts
    return '/'.join(parts)
*/
}

/**
    Return a list of normalized combinations for a `BCP 47` language tag.

    Example:

    >>> from docutils.utils import normalize_language_tag
    >>> normalize_language_tag('de_AT-1901')
    ['de-at-1901', 'de-at', 'de-1901', 'de']
    >>> normalize_language_tag('de-CH-x_altquot')
    ['de-ch-x-altquot', 'de-ch', 'de-x-altquot', 'de']
*/
function normalizedLanguageTag(tag: string) {
    // normalize:
    let myTag = tag.toLowerCase().replace(/-/g, '_');
    // split (except singletons, which mark the following tag as non-standard):
    tag = tag.replace(/_([a-zA-Z0-9])_/g, '$1-');
    const subtags = tag.split('_');
    const base_tag = subtags.pop();
    // find all combinations of subtags
    const taglist = [];
    /*
    for(let i = subtags.length; i >= 0; i -= 1) {
      // for tags in unique_combinations(subtags, n):
        for tags in itertools.combinations(subtags, n):
            taglist.append('-'.join(base_tag+tags))
    taglist += base_tag
    return taglist
*/
}
export {
 findCombiningChars, columnWidth, escape2null, splitEscapedWhitespace, columnIndicies,
  normalizedLanguageTag
};
