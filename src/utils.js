
import * as nodes from './nodes';
import { InvalidArgumentsError, SystemMessage, UnimplementedError as Unimp } from './Exceptions'
//export { SystemMessge };
import { combining } from './utils/combining';

export function getTrimFootnoteRefSpace(settings) {
    /*    """
    Return whether or not to trim footnote space.

    If trim_footnote_reference_space is not None, return it.

    If trim_footnote_reference_space is None, return False unless the
    footnote reference style is 'superscript'.
    """*/
    return false;
}
/*
    if settings.trim_footnote_reference_space is None:
        return hasattr(settings, 'footnote_references') and \
               settings.footnote_references == 'superscript'
    else:
        return settings.trim_footnote_reference_space
*/

export function columnWidth(text) { //fixme
    return text.length;
}
export function isIterable(obj) {
    // checks for null and undefined
    /* instanbul ignore if */
  if (obj == null) {
    return false;
  }
  return typeof obj[Symbol.iterator] === 'function';
}
export const punctuation_chars = {
    openers: '"\\\'(<\\\\[{\\u0f3a\\u0f3c\\u169b\\u2045\\u207d\\u208d\\u2329\\u2768' +
           '\\u276a\\u276c\\u276e\\u2770\\u2772\\u2774\\u27c5\\u27e6\\u27e8\\u27ea' +
           '\\u27ec\\u27ee\\u2983\\u2985\\u2987\\u2989\\u298b\\u298d\\u298f\\u2991' +
           '\\u2993\\u2995\\u2997\\u29d8\\u29da\\u29fc\\u2e22\\u2e24\\u2e26\\u2e28' +
           '\\u3008\\u300a\\u300c\\u300e\\u3010\\u3014\\u3016\\u3018\\u301a\\u301d' +
           '\\u301d\\ufd3e\\ufe17\\ufe35\\ufe37\\ufe39\\ufe3b\\ufe3d\\ufe3f\\ufe41' +
           '\\ufe43\\ufe47\\ufe59\\ufe5b\\ufe5d\\uff08\\uff3b\\uff5b\\uff5f\\uff62' +
           '\\xab\\u2018\\u201c\\u2039\\u2e02\\u2e04\\u2e09\\u2e0c\\u2e1c\\u2e20' +
           '\\u201a\\u201e\\xbb\\u2019\\u201d\\u203a\\u2e03\\u2e05\\u2e0a\\u2e0d' +
        '\\u2e1d\\u2e21\\u201b\\u201f',
    closers: '"\\\')>\\\\]}\\u0f3b\\u0f3d\\u169c\\u2046\\u207e\\u208e\\u232a\\u2769' +
               '\\u276b\\u276d\\u276f\\u2771\\u2773\\u2775\\u27c6\\u27e7\\u27e9\\u27eb' +
               '\\u27ed\\u27ef\\u2984\\u2986\\u2988\\u298a\\u298c\\u298e\\u2990\\u2992' +
               '\\u2994\\u2996\\u2998\\u29d9\\u29db\\u29fd\\u2e23\\u2e25\\u2e27\\u2e29' +
               '\\u3009\\u300b\\u300d\\u300f\\u3011\\u3015\\u3017\\u3019\\u301b\\u301e' +
               '\\u301f\\ufd3f\\ufe18\\ufe36\\ufe38\\ufe3a\\ufe3c\\ufe3e\\ufe40\\ufe42' +
               '\\ufe44\\ufe48\\ufe5a\\ufe5c\\ufe5e\\uff09\\uff3d\\uff5d\\uff60\\uff63' +
               '\\xbb\\u2019\\u201d\\u203a\\u2e03\\u2e05\\u2e0a\\u2e0d\\u2e1d\\u2e21' +
               '\\u201b\\u201f\\xab\\u2018\\u201c\\u2039\\u2e02\\u2e04\\u2e09\\u2e0c' +
        '\\u2e1c\\u2e20\\u201a\\u201e'
}


export class Reporter {
    constructor(source, reportLevel, haltLevel, stream, debug, encoding,
		errorHandler='backslashreplace') {
	if(haltLevel === undefined) {
	    haltLevel = 4;
	}
	this.DEBUG_LEVEL = 0
	this.INFO_LEVEL = 1
	this.WARNING_LEVEL = 2
	this.ERROR_LEVEL = 3
	this.SEVERE_LEVEL = 4
	this.source = source
	this.errorHandler = errorHandler
	this.debugFlag = debug
	this.reportLevel = reportLevel
	this.haltLevel = haltLevel
	// fixme
	this.stream = stream
	this.encoding = encoding; //fixme
	this.observers = []
	this.maxLevel = -1
    }

    setConditions() {
	throw new Unimp();
    }

    /* need better system for arguments!! */
    systemMessage(level, message, children, kwargs) {
	if(children == undefined) {
	    children= []
	}
	if(!isIterable(children)) {
	    //throw new Error(`Children is not iterable ${children}`);
	    kwargs = children
	    children = []
	}
	if(kwargs === undefined) {
	    kwargs = {}
	}

	if(message instanceof Error) {
	    message = message.message;
	}

	const attributes = { ...kwargs };
	if('base_node' in kwargs) {
	    const [ source, line ] = getSourceLine(kwargs.base_node);
	    delete attributes.base_node;
	    if(source && !attributes.source) {
		attributes.source = source;
	    }
	    if(line && !attributes.line) {
		attributes.line = line;
	    }
	}
	if(!('source' in attributes)) {
	    //fixme
	}
	const msg = new nodes.system_message(message, children, attributes)
	if(this.stream) {
	    this.stream.write(msg.astext() + '\n');
	}
	if(this.stream && (level >= this.reportLevel ||
			   (this.debugFlag && level == this.DEBUG_LEVEL)
			   || level >= this.haltLevel)) {
	    this.stream.write(msg.astext() + '\n');
	}
	if(level >= this.haltLevel) {
	    throw new SystemMessage(msg, level);
	}
	if(level > this.debugLevel || this.debugFlag) {
	    this.notifyObservers(msg)
	}
	this.maxLevel = Math.max(level, this.maxLevel)
	return msg
    }

    notifyObservers(message) {
	this.observers.forEach(o => o(message));
    }

    attachObserver(observer) {
	this.observers.push(observer);
    }

    debug(...args) {
	if(this.debugFlag) {
	    return this.systemMessage(this.debugLevel, ...args);
	}
    }
    info(...args) {
	return this.systemMessage(this.INFO_LEVEL, ...args);
    }
    warning(...args) {
	return this.systemMessage(this.WARNING_LEVEL, ...args);
    }
    error(...args) {
	return this.systemMessage(this.ERROR_LEVEL, ...args);
    }
    severe(...args) {
	return this.systemMessage(this.SEVERE_LEVEL, ...args);
    }
}

function _getCallerFile() {
    var originalFunc = Error.prepareStackTrace;

    	let callerfile;
		let callerlineno;
    try {
        var err = new Error();

        Error.prepareStackTrace = function (err, stack) { return stack; };

	const x = err.stack.shift();
 	const currentfile = x.getFileName();
	const currentlineno = x.getLineNumber();
//	process.stderr.write(`${currentfile} ${currentlineno}\n`);

        while (err.stack.length) {
	const x2 = err.stack.shift();
        callerfile = x2.getFileName();
	callerlineno = x2.getLineNumber();

            if(currentfile !== callerfile) break;
            }
    } catch (e) {
        console.log(e);
    }

    Error.prepareStackTrace = originalFunc;

    return [callerfile, callerlineno];
}

export function newReporter({sourcePath}, settings) {
    return new Reporter(sourcePath, settings.reportLevel,
			settings.haltLevel,
			settings.warningStream, settings.debug,
			settings.error_encoding,
			settings.error_encoding_error_handler)
}

export function escape2null(text) {
    //"""Return a string with escape-backslashes converted to nulls."""
    const parts = []
    let start = 0;
    while(true) {
        const found = text.indexOf('\\', start);
        if(found === -1) {
            parts.push(text.substring(start));
            return parts.join('');
	}
        parts.push(text.substring(start, found));
        parts.push('\x00' + text.substring(found+1, found+2));
        start = found + 2               // skip character after escape
    }
}

export function unescape(text, restoreBackslashes=false, respectWhitespace=false) {
    /*
    Return a string with nulls removed or restored to backslashes.
    Backslash-escaped spaces are also removed.
    */
    // `respect_whitespace` is ignored (since introduction 2016-12-16)if(
	if(typeof text === 'undefined') {
		throw new Error();

	}
    if(restoreBackslashes) {
        return text.replace('\x00', '\\');
    } else {
	return ['\x00 ', '\x00\n', '\x00'].reduce((a, v) => { return a.split(v).join('') },text||'')
    }
}


export function newDocument({sourcePath}, settings) {
    const reporter = newReporter({ sourcePath }, settings );
    const document = new nodes.document( settings, reporter, '', [], { source: sourcePath });
    document.noteSource(sourcePath, -1);
    return document;
}

export function splitEscapedWhitespace(text) {
    /*    """
    Split `text` on escaped whitespace (null+space or null+newline).
    Return a list of strings.
    """*/
    const strings = text.split('\x00 ')
    const s = []
    for (const string of strings) {
	s.push(...string.split('\x00\n'));
    }
    return s;
}

export function columnIndicies(text) {
    const stringIndicies = new Array(text.length);
    for(let  i = 0; i < text.length; i++) {
	stringIndicies[i] = i;
    }
    findCombiningChars(text).forEach((index) => {
        stringIndicies[index] = undefined;
    });

    return stringIndicies.filter(i => typeof i !== 'undefined');
}

/*    """Indices of Unicode string `text` when skipping combining characters.

    >>> from docutils.utils import column_indices
    >>> column_indices(u'A t ab le ')
    [0, 1, 2, 4, 5, 7, 8]

    """*/
    // TODO: account for asian wide chars here instead of using dummy
    // replacements in the tableparser?
/*    string_indices = range(len(text))
    findCombiningChars(text).forEach((index) => {
        string_indices[index] = undefined;
    });
    return [i for i in string_indices if i is not None]
}
*/
export function findCombiningChars(text) {
/*"""Return indices of all combining chars in  Unicode string `text`.

    >>> from docutils.utils import find_combining_chars
    >>> find_combining_chars(u'A t ab le ')
    [3, 6, 9]

    """*/
    return text.split('').map((c, i) => {
	const r = combining[text.codePointAt(i)]
	return [r, i];
    }).filter(([r, i]) => r).map(([r, i]) => i);
}


export default {
    newDocument,
}

