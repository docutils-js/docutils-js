import * as statemachine from '../../StateMachine';
import * as languages from '../../languages';
import * as nodes from '../../nodes';
import { matchChars } from '../../utils/punctuationChars';

import { DataError, EOFError, InvalidArgumentsError, UnimplementedError as Unimp } from '../../Exceptions';
import { punctuation_chars, column_width, unescape } from '../../utils';

class MarkupError extends DataError { }

const normalize_name = (x) => x;

const { StateMachineWS } = statemachine;
const { StateWS } = statemachine;
function isIterable(obj) {
  // checks for null and undefined
  if (obj == null) {
    return false;
  }
  return typeof obj[Symbol.iterator] === 'function';
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
function buildRegexp(definition, compile = true) {
    const di = (isIterable(definition));
    let [fakeTuple, name, prefix, suffix, parts] = definition;
    let prefixNames = [];
    if (Array.isArray(prefix)) {
        prefix.shift();
        const pr = prefix.shift();
        prefixNames = [...prefix];
        prefix = pr;
    }
    if (suffix === undefined) {
        throw new Error();
    }
    let suffixNames = [];
    if (Array.isArray(suffix)) {
        suffix.shift();
        const sr = suffix.shift();
        suffixNames = [...suffix];
        suffix = sr;
    }

    if (!fakeTuple) {
        throw new Error();
    }
    const pi = isIterable(parts);
//    console.log(`buildRegexp(${name} - ${pi})`);
    const partStrings = [];
//    console.log(parts);
    if (parts === undefined) {
        throw new Error();
    }
    const fakeTuple2 = parts.shift();
    const groupNames = [];
    for (const part of parts) {
        const fakeTuple3 = Array.isArray(part) ? part[0] : undefined;
        if (fakeTuple3 === 1) {
            const [regexp, subGroupNames] = buildRegexp(part, null);
            groupNames.push(...subGroupNames);
            partStrings.push(regexp);
        } else if (fakeTuple3 === 2) {
            part.shift();
            const regexp = part.shift();
            partStrings.push(regexp);
                groupNames.push(...part);
            } else {
                partStrings.push(part);
            }
    }
    const orGroup = partStrings.map(x => `(${x})`).join('|');
    const regexp = `${prefix}(${orGroup})${suffix}`;
//    console.log(new RegExp(regexp))
    groupNames.splice(0, 0, ...prefixNames, name);
    groupNames.push(...suffixNames);
//    console.log('groupnames')
//    console.log(groupNames);
//    console.log(`regexp is ${regexp}`);
    if (compile) {
        return [new RegExp(regexp), groupNames];
    }

        return [regexp, groupNames];
}
export class Inliner {
    constructor() {
        this.dispatch = {
	    '*': this.emphasis.bind(this),
            '**': this.strong.bind(this),
            '``': this.literal.bind(this),
            '`': this.interpreted_or_phrase_ref.bind(this),
	};
        /*
                    '_`': this.inline_internal_target.bind(this)
                    ']_': this.footnote_reference.bind(this)
                    '|': this.substitution_reference.bind(this)
                    '_': this.reference.bind(this)
                    '__': this.anonymous_reference.bind(this)}
*/

        this.implicitDispatch = [];
        this.nonWhitespaceAfter = '';
	this.nonWhitespaceBefore = '(?<!\\s)'
        this.nonWhitespaceEscapeBefore = '(?<![\\s\\x00])';

	this.nonUnescapedWhitespaceEscapeBefore = '(?<!(?<!\\x00)[\\s\\x00])'

    }

    substitution_reference(match, lineno) {
        const [ before, inlines, remaining, sysmessages, endstring ] = this.inline_obj(
              match, lineno, this.patterns.substitution_ref,
              nodes.substitution_reference)
        if(inlines.length === 1) {
            const subrefNode = inlines[0]
            if(subrefNode instanceof nodes.substitution_reference) {
                const subrefText = subrefNode.astext()
                this.document.note_substitution_ref(subrefNode, subrefText)
		if(endstring[endstring.length - 1] === '_') {
                    const referenceNode = new nodes.reference(
                        '|' + subrefText + endstring, '')
                    if(endstring.endsWith('__')) {
                        referenceNode.attributes['anonymous'] = 1
		    } else {
                        referenceNode.attributes['refname'] = normalize_name(subrefText)
                        this.document.note_refname(reference_node)
		    }
                    referenceNode.add(subrefNode)
                    const inlines = [reference_node]
		}
	    }
	}
        return [before, inlines, remaining, sysmessages]
    }
    
    footnote_reference( match, lineno) {
	const label = match.group['footnotelabel']
	const refname = normalize_name(label)
	const string = match.result.input
	let before = string.substring(0, match.result.index)
	let remaining = string.substring(match.result.index + match.result[0].length);
	let refnode;
	if(match.group['citationlabel']) {
            refnode = new nodes.citation_reference('[%s]_' % label, [],
						   { refname })
            refnode += nodes.Text(label)
            this.document.note_citation_ref(refnode)
	} else {
            refnode = new nodes.footnote_reference('[%s]_' % label)
            if(refname[0] === '#') {
		const refname = refname.substring(1);
		refnode.attributes['auto'] = 1
		this.document.note_autofootnote_ref(refnode)
	    } else if(refname === '*') {
                refname = ''
                refnode.attributes['auto'] = '*'
                this.document.note_symbol_footnote_ref(
                    refnode)
	    } else {
                refnode,add(new nodes.Text(label))
	    }
            if(refname) {
                refnode.attributes['refname'] = refname
                this.document.note_footnote_ref(refnode)
	    }
            if(utils.getTrimFootnoteRefSpace(this.document.settings)) {
                before = before.trimRight()
	    }
	}
        return [before, [refnode], remaining, []]
    }

    reference(match, lineno, anonymous=false) {
        const referencename = match.group['refname']
        const refname = normalize_name(referencename)
        const referencenode = new nodes.reference(
            referencename + match.group['refend'], referencename, [],
            { name: whitespace_normalize_name(referencename)})
        referencenode[0].rawsource = referencename
        if(anonymous) {
            referencenode.attributes['anonymous'] = 1
	} else {
            referencenode.attributes['refname'] = refname
            this.document.note_refname(referencenode)
	}
        string = match.result.input
        matchstart = match.result.index
        matchend = match.result.index + match.result[0].length
        return [string.substring(0, matchstart), [referencenode], string.substring(matchend), []]
    }
    
    anonymous_reference(match, lineno) {
	return this.reference(match, lineno, true);
    }
    
    inline_internal_target( match, lineno) {
        const [ before, inlines, remaining, sysmessages, endstring ] = this.inline_obj(
              match, lineno, this.patterns.target, nodes.target)
        if(inlines && inlines[0] instanceof nodes.target) {
            //assert len(inlines) == 1
            const target = inlines[0]
            const name = normalize_name(target.astext())
            target.attributes['names'].append(name)
            this.document.note_explicit_target(target, this.parent)
	}
        return [ before, inlines, remaining, sysmessages ]
    }

    problematic(text, rawsource, message) {
        const msgid = this.document.setId(message, this.parent);
        const problematic = new nodes.problematic(rawsource, text, [], { refid: msgid });
        const prbid = this.document.setId(problematic);
        message.addBackref(prbid);
        return problematic;
    }

    emphasis(match, lineno) {
        const [before, inlines, remaining, sysmessages, endstring] = this.inline_obj(match, lineno, this.patterns.emphasis, nodes.emphasis);
        return [before, inlines, remaining, sysmessages];
   }

    strong(match, lineno) {
        const [before, inlines, remaining, sysmessages, endstring] = this.inline_obj(match, lineno, this.patterns.strong, nodes.strong);
        return [before, inlines, remaining, sysmessages];
    }

    interpreted_or_phrase_ref(match, lineno) {
        const end_pattern = this.patterns.interpreted_or_phrase_ref
        const string = match.match.input
	console.log(match.groups);
	const matchstart = match.match.index
        const matchend = matchstart + match.match[0].length
        const rolestart = match.match.input.indexOf(match.groups['role'])
        let role = match.groups['role']
        let position = ''
        if(role) {
            role = role.substring(1, role.length - 1)
            position = 'prefix'
	} else if(this.quoted_start(match)) {
            return [string.substring(0, matchend), [], string.substring(matchend), []]
	}	    
        const endmatch = end_pattern.exec(string.substring(matchend));
        if(endmatch && endmatch[0].length) {
            const textend = matchend + endmatch.index + endmatch[0].length
            /*
            if endmatch.group('role'):
                if role:
                    msg = self.reporter.warning(
                        'Multiple roles in interpreted text (both '
                        'prefix and suffix present; only one allowed).',
                        line=lineno)
                    text = unescape(string[rolestart:textend], True)
                    prb = self.problematic(text, text, msg)
                    return string[:rolestart], [prb], string[textend:], [msg]
                role = endmatch.group('suffix')[1:-1]
                position = 'suffix'
            escaped = endmatch.string[:endmatch.start(1)]
            rawsource = unescape(string[matchstart:textend], True)
            if rawsource[-1:] == '_':
                if role:
                    msg = self.reporter.warning(
                          'Mismatch: both interpreted text role %s and '
                          'reference suffix.' % position, line=lineno)
                    text = unescape(string[rolestart:textend], True)
                    prb = self.problematic(text, text, msg)
                    return string[:rolestart], [prb], string[textend:], [msg]
                return self.phrase_ref(string[:matchstart], string[textend:],
                                       rawsource, escaped, unescape(escaped))
            else:
                rawsource = unescape(string[rolestart:textend], True)
                nodelist, messages = self.interpreted(rawsource, escaped, role,
                                                      lineno)
                return (string[:rolestart], nodelist,
                        string[textend:], messages)
            */
	}
        const msg = this.reporter.warning(
            'Inline interpreted text or phrase reference start-string '+
		'without end-string.', [], {line: lineno})
        const text = unescape(string.substring(matchstart, matchend), true);
        const prb = this.problematic(text, text, msg)
        return [string.substring(0, match.match.index), [prb], string.substring(matchend), [msg]]
    }

    quoted_start(match) {
        /*"""Test if inline markup start-string is 'quoted'.

        'Quoted' in this context means the start-string is enclosed in a pair
        of matching opening/closing delimiters (not necessarily quotes)
        or at the end of the match.
        """*/
        const string = match.result.input
        const start = match.result.index
        if(start === 0) { // start-string at beginning of text
            return false;
	}
        let poststart;
        const prestart = string[start - 1]
        try {
	    poststart = string.substr(match.result.index + match.result[0].length, 1);
	} catch(error) {
	    console.log(error.constructor.name);
	    return true; // not "quoted" but no markup start-string either
	}
        return matchChars(prestart, poststart)
    }

    inline_obj(match, lineno, end_pattern, nodeclass,
                restore_backslashes = false) {
        if (typeof nodeclass !== 'function') {
            throw new Error();
        }

        if (!(end_pattern instanceof RegExp)) {
            throw new Error('');
        }

//      console.log(match);
        const string = match.match.input;
        const matchstart = string.indexOf(match.groups.start);
        if (matchstart == -1) {
            throw new Error('');
        }

        const matchend = matchstart + match.groups.start.length;
//      console.log(`${matchstart} ${matchend}`);
        if (this.quoted_start(match)) {
            return [string.substring(0, matchend), [], string.substring(matchend), [], ''];
        }
//      console.log(end_pattern);
        const endmatch = end_pattern.exec(string.substring(matchend));
        let text; let
rawsource;
        if (endmatch && endmatch.index) { // 1 or more chars
            const _text = endmatch.input.substring(0, endmatch.index);
            text = _text;// unescape(_text, restore_backslashes)
            // this may not work for all situations
            const textend = matchend + endmatch.index + endmatch[0].length;
            rawsource = string.substring(matchstart, textend);// //unescape(string[matchstart:textend], True)
            const node = new nodeclass(rawsource, text);
            node.children[0].rawsource = _text;// fixme unescape(_text, true)
            return [string.substr(0, matchstart), [node],
                    string.substr(textend), [], endmatch[1]];
        }
        const msg = this.reporter.warning(
            `Inline ${nodeclass.constructor.name} start-string without end-string.`, { line: lineno },
);
        text = string.substring(matchstart, matchend);// unescape(string[matchstart:matchend], True)
        rawsource = text;// unescape(string[matchstart:matchend], True)
        const prb = this.problematic(text, rawsource, msg);
        return [string.substring(0, matchstart), [prb], string.substring(matchend), [msg], ''];
    }

    initCustomizations(settings) {
        let startStringPrefix; let
endStringSuffix;
        let ssn; let
esn;
        if (settings.character_level_inline_markup) {
            startStringPrefix = '(^|(?<!\\x00))';
            ssn = [null, null];
            endStringSuffix = '';
            esn = [];
        } else {
            startStringPrefix = '';/* '(^|(?<=\\s|[' +
                punctuation_chars.openers +
                punctuation_chars.delimiters +
                ']))' */
            ssn = [];
            endStringSuffix = '';/* '($|(?=\\s|[\\x00' + [
                punctuation_chars.closing_delimiters,
                punctuation_chars.delimiters,
                punctuation_chars.closers].join('') +
                ']))' */
            esn = [];
        }
//      this.simplename = '(?:(?!_)\\w)+(?:[-._+:](?:(?!_)\\w)+)*'
        this.simplename = '\\w+';

        const prefix = startStringPrefix;
        const suffix = endStringSuffix;
/*      const initialInline =
              { prefix, suffix: '',
                parts: {
                    start: {
                        prefix: '',
                        suffix: this.nonWhitespaceAfter,
                        parts: ['\\*\\*','\\*(?!\\*)','``','_`', '\\|(?!\\|)'],
                    },
                    whole: {
                        prefix: '',
                        suffix,
                        parts:
*/
        const parts = [1, 'initial_inline', startStringPrefix, '',
           [0, [1, 'start', '', this.nonWhitespaceAfter, // simple start-strings
             [0, '\\*\\*', // strong
              '\\*(?!\\*)', // emphasis but not strong
              '``', // literal
              '_`', // inline internal target
              [2, '\\|(?!\\|)', null]], // substitution reference
             ],
            [1, 'whole', '', endStringSuffix, // whole constructs
             [0, // reference name & end-string
              [2, `(${this.simplename})(__?)`, 'refname', 'refend'],
              [1, 'footnotelabel', '\\[', [2, '(\\]_)', 'fnend'],
               [0, '[0-9]+', // manually numbered
                [2, `\\#(${this.simplename})?`, null], // auto-numbered (w/ label?)
                '\\*', // auto-symbol
                [2, `(${this.simplename})`, 'citationlabel']], // citation reference
               ],
              ],
             ],
            [1, 'backquote', // interpreted text or phrase reference
             [2, `((:${this.simplename}:)?)`, 'role', null], // optional role
             this.nonWhitespaceAfter,
             [0, [2, '`(?!`)', null]], // but not literal
             ],
            ],
           ];
        this.startStringPrefix = startStringPrefix;
        this.endStringSuffix = endStringSuffix;
        this.parts = parts;
//      const build = buildRegexp(parts, true);
//      console.log(build[0]);
        this.patterns = {
            initial: buildRegexp(parts), // KM
            emphasis: new RegExp(`${this.nonWhitespaceEscapeBefore}(\\*)${endStringSuffix}`),
            strong: new RegExp(`${this.nonWhitespaceEscapeBefore}(\\*\\*)${endStringSuffix}`),
	    literal: new RegExp(this.nonWhitespaceBefore + '(``)' + endStringSuffix),
            interpreted_or_phrase_ref: new RegExp(`${this.nonUnescapedWhitespaceEscapeBefore}(\`((:${this.simplename}:)?(__?)?))${endStringSuffix}`)
        };
    }

    parse(text, { lineno, memo, parent }) {
        this.reporter = memo.reporter;
        this.document = memo.document;
        this.language = memo.language;
        this.parent = parent;
//      console.log(new RegExp(this.patterns.initial[0]));
        const patternSearch = this.patterns.initial[0][Symbol.match].bind(this.patterns.initial[0]);
//      console.log(this.patterns.initial[0]);
        const { dispatch } = this;
//      console.log(text.constructor.name);
        let remaining = text;// escape2null(text)
        const processed = [];
        let unprocessed = [];
        const messages = [];
        while (remaining) {
            const match = this.patterns.initial[0].exec(remaining);
//          console.log(match);
            if (match) {
                const rr = {};

                this.patterns.initial[1].forEach((x, index) => {
                    rr[x] = match[index];
                });
                const method = this.dispatch[rr.start];
                if (typeof method !== 'function') {
                    throw new Error(`Invalid dispatch ${rr.start}`);
                }
                let before; let inlines; let
sysmessages;
                [before, inlines, remaining, sysmessages] = method({ result: match, match, groups: rr }, lineno);
                unprocessed.push(before);
                messages.push(...sysmessages)
                if (inlines) {
                    processed.push(...this.implicit_inline(unprocessed.join(''),
                                                       lineno));
                    processed.push(...inlines);
                    unprocessed = [];
                }
            } else {
                break;
            }
        }
        if (remaining) {
            processed.push(...this.implicit_inline(remaining, lineno));
        }
//      console.log(processed);
        return [processed, messages];
    }

    implicit_inline(text, lineno) {
        if (!text) {
            return [];
        }
        // FIXME
        return [new nodes.Text(text, text)];
    }

    literal(match, lineno) {
        const [ before, inlines, remaining, sysmessages, endstring ] = this.inline_obj(
            match, lineno, this.patterns.literal, nodes.literal, true)
        return [ before, inlines, remaining, sysmessages ]
    }
}

export class RSTStateMachine extends StateMachineWS {
    run({
 inputLines, document, inputOffset, matchTitles, inliner,
}) {
        if(inputOffset === undefined) {
            inputOffset = 0;
        }
        if (!document) {
            throw new Error('need document');
        }

        if (matchTitles === undefined) {
            matchTitles = true;
        }
        this.language = languages.getLanguage(document.settings.languageCode);
        this.matchTitles = matchTitles;
        if (inliner === undefined) {
            inliner = new Inliner();
        }
        inliner.initCustomizations(document.settings);
        this.memo = {
	    document,
	    reporter: document.reporter,
	    language: this.language,
            titleStyles: [],
                      sectionLevel: 0,
                      sectionBubbleUpKludge: false,
                      inliner,
};
        this.document = document;
        this.attachObserver(document.noteSource.bind(document));
        this.reporter = this.memo.reporter;
        this.node = document;
        const results = super.run({ inputLines, inputOffset, inputSource: document.source });
        if (results.length !== 0) {
//          throw new Error("should be o");
        }
        this.node = this.memo = undefined;
    }
}

class NestedStateMachine extends StateMachineWS {
    run({
 inputLines, inputOffset, memo, node, matchTitles,
}) {
        if (!inputLines) {
            throw new Error('need inputlines');
        }

        if (matchTitles === undefined) {
            matchTitles = true;
        }
        this.matchTitles = matchTitles;
        this.memo = memo;
        this.document = memo.document;
        if (!this.document) {
            throw new Error('need document');
        }

        this.attachObserver(this.document.noteSource.bind(this.document));
        this.reporter = memo.reporter;
        this.language = memo.language;
        this.node = node;
        const results = super.run({ inputLines, inputOffset });
        if(results === undefined) {
            throw new Error();
        }
        return results;
    }
}

class RSTState extends StateWS {
    _init(args) {
        super._init(args);
        this.nestedSm = NestedStateMachine;
        this.nestedSmCache = [];
        this.stateClasses = stateClasses;
        this.nestedSmKwargs = {
	    stateClasses: this.stateClasses,
            initialState: 'Body',
	    debug: args.stateMachine.debug,
	    debugFn: args.stateMachine.debugFn,
	};
    }

    runtimeInit() {
        super.runtimeInit();
        const { memo } = this.stateMachine;
        this.memo = memo;
        this.reporter = memo.reporter;
        this.inliner = memo.inliner;
        this.document = memo.document;
        this.parent = this.stateMachine.node;
        if (!this.reporter.getSourceAndLine) {
            this.reporter.getSourceAndLine = this.stateMachine.getSourceAndLine;
        }
    }

    gotoLine(absLineOffset) {
        try {
            this.stateMachine.gotoLine(absLineOffset);
        } catch (ex) {
            /* test for eof error? */
        }
    }

    noMatch(context, transitions) {
        this.reporter.severe(`Internal error: no transition pattern match.  State: "${this.constructor.name}"; transitions: ${transitions}; context: ${context}; current line: ${this.stateMachine.line}.`);
        return [context, null, []];
    }

    bof(context) {
        return [[], []];
    }

    nestedParse(block, {
 inputOffset, node, matchTitles, stateMachineClass, stateMachineKwargs,
}) {
        if (!this.memo || !this.memo.document) {
            throw new Error('need memo');
        }
        if (!block) {
            throw new Error('need block');
        }

        let useDefault = 0;
        if (!stateMachineClass) {
            stateMachineClass = this.nestedSm;
            useDefault += 1;
        }
        if (!stateMachineKwargs) {
            stateMachineKwargs = this.nestedSmKwargs;
            useDefault += 1;
        }
        const blockLength = block.length;

        let stateMachine;
        if (useDefault === 2) {
            try {
                stateMachine = this.nestedSmCache.pop();
            } catch (err) {
            }
        }

        if (!stateMachine) {
            if (!stateMachineKwargs.stateClasses) {
                throw new InvalidArgumentsError('stateClasses');
            }
//          if(!stateMachineKwargs.document) {
//              throw new Error("expectinf document")
//          }
            stateMachine = new stateMachineClass({
 debug: this.debug,
                                                  ...stateMachineKwargs,
});
        }
        stateMachine.run({
 inputLines: block,
inputOffset,
memo: this.memo,
                          node,
matchTitles,
});
        if (useDefault === 2) {
            this.nestedSmCache.push(stateMachine);
        } else {
            stateMachine.unlink();
        }
        const newOffset = stateMachine.absLineOffset();
        if (block.parent && (len(block) - block_length) !== 0) {
            this.stateMachine.nextLine(block.length - blockLength);
        }
        return newOffset;
    }

    nestedListParse(block, {
 inputOffset, node, initialState,
                     blankFinish, blankFinishState, extraSettings,
                     matchTitles,
                     stateMachineClass,
                     stateMachineKwargs,
}) {
        if (extraSettings == null) {
                extraSettings = {};
        }
        if (!stateMachineClass) {
            stateMachineClass = this.nestedSm;
        }
        if (!stateMachineKwargs) {
            stateMachineKwargs = { ...this.nestedSmKwargs };
        }
        stateMachineKwargs.initialState = initialState;
        const stateMachine = new stateMachineClass({
 debug: this.debug,
                                                    ...stateMachineKwargs,
});
        if (!blankFinishState) {
            blankFinishState = initialState;
        }
        if (!(blankFinishState in stateMachine.states)) {
            throw new InvalidArgumentsError(`invalid state ${blankFinishState}`);
        }

        stateMachine.states[blankFinishState].blankFinish = blankFinish;
        Object.keys(extraSettings).forEach((key) => {
            stateMachine.states[initialState][key] = extraSettings[key];
        });
        stateMachine.run({
 inputLines: block,
inputOffset,
memo: this.memo,
                          node,
matchTitles,
});
        blankFinish = stateMachine.states[blankFinishState].blankFinish;
        stateMachine.unlink();
        return [stateMachine.absLineOffset(), blankFinish];
    }

    section({
 title, source, style, lineno, messages,
}) {
        if (this.checkSubsection({ source, style, lineno })) {
            this.newSubsection({ title, lineno, messages });
        }
    }

    checkSubsection({source, style, lineno}) {
        const memo = this.memo
        const title_styles = memo.titleStyles
        const mylevel = memo.sectionLevel
	let level = 0;
	level = title_styles.indexOf(style) + 1
	if(level == 0) {
            if(title_styles.length == memo.sectionLevel) { // new subsection
                title_styles.push(style)
                return 1
	    } else {
                this.parent.add(this.title_inconsistent(source, lineno))
                return None
	    }
	}
        if(level <= mylevel) {//            // sibling or supersection
            memo.sectionLevel = level   // bubble up to parent section
            if(style.length === 2) {
                memo.sectionBubbleUpKludge = True
            }
            // back up 2 lines for underline title, 3 for overline title
            this.stateMachine.previousLine(style.length + 1)
            throw new EOFError()    // let parent section re-evaluate

	}
	
	if(level === mylevel + 1) {        // immediate subsection
            return 1
	} else {
            this.parent.add(this.title_inconsistent(source, lineno))
            return undefined;
	}
    }

    title_inconsistent( sourcetext, lineno)  {
	const error = this.reporter.severe(
            'Title level inconsistent:', [new nodes.literal_block('', sourcetext)], { line: lineno });
        return error
    }


    newSubsection({title, lineno, messages}) {
        const memo = this.memo
        const mylevel = memo.sectionLevel
        memo.sectionLevel += 1
        const section_node = new nodes.section()
        this.parent.add(section_node)
        const [ textnodes, title_messages ] = this.inline_text(title, lineno)
        const titlenode = new nodes.title(title, '', textnodes)
        const name = normalize_name(titlenode.astext())
        section_node.attributes['names'].push(name)
        section_node.add(titlenode)
        section_node.add(messages)
        section_node.add(title_messages)
        this.document.noteImplicitTarget(section_node, section_node)
        const offset = this.stateMachine.lineOffset + 1
        const absoffset = this.stateMachine.absLineOffset() + 1
        const newabsoffset = this.nestedParse(
            this.stateMachine.inputLines.slice(offset), {inputOffset: absoffset,
							 node: section_node, matchTitles: true})
        this.gotoLine(newabsoffset)
        if(memo.sectionLevel <= mylevel) {
            throw new EOFError()
	}
	
            memo.sectionLevel = mylevel
    }

    unindentWarning(nodeName) {
        const lineno = this.stateMachine.absLineNumber() + 1;
        return this.reporter.warning(`${nodeName} ends without a blank line; unexpected unindent.`, { line: lineno });
    }

    paragraph(lines, lineno) {
        const data = [lines].flatMap(x => x).join('\n').replace(/\s*$/, '');
        let text;
        let literalnext;
        if (/(?<!\\)(\\\\)*::$/.test(data)) {
            if (data.length == 2) {
                return [[], 1];
            }
            if (' \n'.indexOf(data[length.data - 3]) !== -1) {
                text = data.substring(0, data.length - 3).replace(/\s*$/, '');
            } else {
                text = data.substring(0, data.length - 1);
            }
            literalnext = 1;
        } else {
            text = data;
            literalnext = 0;
        }
        const r = this.inline_text(text, lineno);
        const [textnodes, messages] = r;
        const p = new nodes.paragraph(data, '', textnodes);
        [p.source, p.line] = this.stateMachine.getSourceAndLine(lineno);
        return [[p, ...messages], literalnext];
    }

    inline_text(text, lineno) {
        const r = this.inliner.parse(text, { lineno, memo: this.memo, parent: this.parent });
//      console.log(r);
        return r;
    }
}

function _loweralpha_to_int() {
}

function _upperalpha_to_int() {
}

function _uppseralpha_to_int() {
}

function _lowerroman_to_int() {
}

function _upperroman_to_int() {
}


export class Body extends RSTState {
    constructor(args) {
        super(args);
        const pats = { };
        const _enum = { };

        pats.nonalphanum7bit = '[!-/:-@[-\`{-~]';
        pats.alpha = '[a-zA-Z]';
        pats.alphanum = '[a-zA-Z0-9]';
        pats.alphanumplus = '[a-zA-Z0-9_-]';

        this.pats = pats;
    }

    _init(args) {
        super._init(args);
//      this.doubleWidthPadChar = tableparser.TableParser.doubleWidthPadChar

        const enum_ = { };
        enum_.formatinfo = {
            parens: {
 prefix: '\\(', suffix: '\\)', start: 1, end: 1,
},
            rparen: {
 prefix: '', suffix: '\\)', start: 0, end: -1,
},
            period: {
 prefix: '', suffix: '\\.', start: 0, end: -1,
},
        };
        enum_.formats = Object.keys(enum_.formatinfo);
        enum_.sequences = ['arabic', 'loweralpha', 'upperalpha',
                               'lowerroman', 'upperroman'];
        enum_.sequencepats = {
 arabic: '[0-9]+',
                         loweralpha: '[a-z]',
                         upperalpha: '[A-Z]',
                         lowerroman: '[ivxlcdm]+',
                         upperroman: '[IVXLCDM]+',
};
        enum_.converters = {
 arabic: parseInt,
                       loweralpha: _loweralpha_to_int,
                       upperalpha: _upperalpha_to_int,
                       lowerroman: _lowerroman_to_int,
                            upperroman: _upperroman_to_int,
};

        enum_.sequenceregexps = {};
        for (const sequence of enum_.sequences) {
            enum_.sequenceregexps[sequence] = new RegExp(`${enum_.sequencepats[sequence]}$`);
        }
        this.enum = enum_;

        this.gridTableTopPat = new RegExp('\\+-[-+]+-\\+ *$');
        this.simpleTableTopPat = new RegExp('=+( +=+)+ *$');

        const pats = {};
        pats.nonalphanum7bit = '[!-/:-@[-`{-~]';
        pats.alpha = '[a-zA-Z]';
        pats.alphanum = '[a-zA-Z0-9]';
        pats.alphanumplus = '[a-zA-Z0-9_-]';
        pats.enum = '';//('(%(arabic)s|%(loweralpha)s|%(upperalpha)s|%(lowerroman)s' +'|%(upperroman)s|#)' % enum.sequencepats)
        pats.optname = `${pats.alphanum}${pats.alphanumplus}*`;
        pats.optarg = `(${pats.alpha}${pats.alphanumplus}*|<[^<>]+>)`;
        pats.shortopt = `(-|\\+)${pats.alphanum}( ?${pats.optarg})?`;
        pats.longopt = `(--|/)${pats.optname}([ =]${pats.optargs})?`;
        pats.option = `(${pats.shortopt}|${pats.longopt})`;

        for (const format of enum_.formats) {
            pats[format] = `(${
                [enum_.formatinfo[format].prefix,
                 pats.enum,
                 enum_.formatinfo[format].suffix].join('')})`;
        }

        this.patterns = {
 bullet: '[-+*\u2022\u2023\u2043]( +|$)',
                          enumerator: `(${pats.parens}|${pats.rparen}|${pats.period})( +|$)`,
            'field_marker': ':(?![: ])([^:\\\\]|\\\\.|:(?!([ `]|$)))*(?<! ):( +|$)',                          grid_table_top: this.gridTableTopPat,
	    'option_marker': `${pats.option}(, ${pats.option})*(  +| ?$)`,
	    'doctest': '>>>( +|$)',
                          simple_table_top: this.simpleTableTopPat,
                          line: `(${pats.nonalphanum7bit})\\1* *$`,
                          text: '',
                        };
//      console.log(this.enumerator);

        this.initialTransitions = ['bullet', 'enumerator', 'field_marker', 'option_marker', 'doctest', 'line', 'text'];
/*          'enumerator',
          'field_marker',
          'option_marker',
          'doctest',
          'line_block',
          'grid_table_top',
          'simple_table_top',
          'explicit_markup',
          'anonymous',
          'line',
            'text' */
    }

    indent(match, context, nextState) {
        const [indented, indent, lineOffset, blankFinish] = this.stateMachine.getIndented({});
        if(indented === undefined) {
            throw new Error();
        }
        const elements = this.block_quote(indented, lineOffset);
        this.parent.add(elements);
        if (!blankFinish) {
            this.parent.add(this.unindentWarning('Block quote'));
        }
        return [context, nextState, []];
    }

    block_quote(indented, lineOffset) {
        if(!indented) {
            throw new Error();
        }
        const elements = [];
        while (indented && indented.length) {
            const [blockquote_lines,
             attribution_lines,
             attribution_offset,
             outIndented,
             new_line_offset] = this.split_attribution(indented, lineOffset);
            const blockquote = new nodes.block_quote();
	    indented = outIndented;
            this.nestedParse(blockquote_lines, { inputOffset: lineOffset, node: blockquote });
            elements.push(blockquote);
            if (attribution_lines) { // fixme
                const [attribution, messages] = this.parse_attribution(attribution_lines, attribution_offset);
                blockquote.add(attribution);
                elements.push(...messages);
            }
            lineOffset = new_line_offset;
            while (indented && indented.length && !indented[0]) {
                indented = indented.slice(1);
                lineOffset += 1;
            }
        }
        return elements;
    }

    split_attribution(indented, lineOffset) {
	this.attribution_pattern = new RegExp('(---?(?!-)|\\u2014) *(?=[^ \\n])');
        let blank;
        let nonblank_seen = false;
        for (let i = 0; i < indented.length; i++) {
            const line = indented[i].trimRight();
            if (line) {
                if (nonblank_seen && blank === i - 1) {
                    const match = this.attribution_pattern.exec(line);
                    if (match) {
                        const [attribution_end, indent] = this.check_attribution(indented, i);
                        if (attribution_end) {
                            const a_lines = indented.slice(i, attribution_end);
                            a_lines.trimLeft(match.index + match[0].length, undefined, 1); // end=1 check fixme
                            a_lines.trimLeft(indent, 1);
                            return [indented.slice(0, i), a_lines,
                                    i, indented.slice(attribution_end),
                                    lineOffset + attribution_end]
                        }
                    }
                }
                nonblank_seen = true;
            } else {
                blank = i;
            }
        }
        return [indented, null, null, null, null];
    }

    check_attribution(indented, attribution_start) {
        let indent = null
        let i;
	for( i = attribution_start + 1; i < indented.length; i++) {
            const line = indented[i].trimRight()
            if (!line) {
                break

            }
            if (indent == null) {
                indent = line.length - line.trimLeft().length;
            } else if ((line.length - line.lstrip().length) !== indent) {
                return [null, null]      // bad shape; not an attribution
            }
        }
	if(i === indented.length) {
	    i++;

	}
        return [i, indent || 0]
    }
    
    enumerator(match, context, nextState) {
        const [format, sequence, text, ordinal] = this.parseEnumerator(match);
        if (!this.isEnumeratedListItem(ordinal, sequence, format)) {
            throw new statemachine.TransitionCorrection('text');
        }
        const enumlist = nodes.enumerated_list();
        this.parent.add(enumlist);
        if (sequence === '#') {
            enumlist.enumtype = 'arabic';
        } else {
            enumlist.enumtype = sequence;
        }
        enumlist.prefix = this.enum.formatinfo[format].prefix;
        enumlist.suffix = this.enum.formatinfo[format].suffix;
        if (ordinal !== 1) {
            enumlist.start = ordinal;
            const msg = this.reporter.info(
                `Enumerated list start value not ordinal-1: "${text}" (ordinal ${ordinal})`,
);
            this.parent.add(msg);
        }
        let listitem; let
blankFinish;
        [listitem, blankFinish] = this.list_item(match.match.index + match.match[0].length);
        enumlist.add(listitem);
        const offset = this.stateMachine.lineOffset + 1; // next line
                let newlineOffset;
        [newlineOffset, blankFinish] = this.nestedListParse(
            this.stateMachine.inputLines.slice(offset),
                {
 inputOffset: this.stateMachine.absLineOffset() + 1,
            node: enumlist,
initialState: 'EnumeratedList',
            blankFinish,
            extraSettings: {
 lastordinal: ordinal,
                           format,
                           auto: sequence === '#',
},
},
);
        this.gotoLine(newlineOffset);
        if (!blankFinish) {
            this.parent.add(this.unindent_warning('Enumerated list'));
        }
        return [[], nextState, []];
    }

    parse_attribution(indented, line_offset) {
        const text = indented.join('\n').trimRight();
        const lineno = this.stateMachine.absLineNumber() + line_offset;
        const [ textnodes, messages ] = this.inline_text(text, lineno)
        const anode = new nodes.attribution(text, '', textnodes)
        const [ source, line ] = this.stateMachine.getSourceAndLine(lineno)
        anode.source = source;
        anode.line = line;
        return [ anode, messages ]
    }

    bullet(match, context, nextState) {
//      console.log(`in bullet`);
        const bulletlist = new nodes.bullet_list();
        [bulletlist.source,
         bulletlist.line] = this.stateMachine.getSourceAndLine();
//      console.log(`${bulletlist.source} ${bulletlist.line}`);
        if (!this.parent) {
            throw new Error('no parent');
        }

        this.parent.add(bulletlist);
        bulletlist.attributes.bullet = match.result[0].substring(0, 1);

        let [i, blankFinish] = this.list_item(match.pattern.lastIndex + match.result[0].length); /* -1 ? */
        if (!i) {
            throw new Error('no node');
        }

        bulletlist.append(i);
        const offset = this.stateMachine.lineOffset + 1;
        let newLineOffset;
        [newLineOffset, blankFinish] = this.nestedListParse(this.stateMachine.inputLines.slice(offset), {
 inputOffset: this.stateMachine.absLineOffset() + 1,
                                                                                                           node: bulletlist,
initialState: 'BulletList',
                                                                                                           blankFinish,
});
        this.gotoLine(newLineOffset);
        if (!blankFinish) {
            // this.parent.append(this.unindentWarning('Bullet list'))
        }
        return [[], nextState, []];
    }

    list_item(indent) {
//      console.log(`in list_item (indent=${indent})`);
        if (indent == null) {
            throw new Error('Need indent');
        }

        let indented; let line_offset; let blank_finish;
	let outIndent;
        if (this.stateMachine.line.length > indent) {
//          console.log(`get known indentd`);
            [indented, line_offset, blank_finish] = this.stateMachine.getKnownIndented({ indent });
        } else {
            [indented, outIndent, line_offset, blank_finish] = (
                this.stateMachine.getFirstKnownIndented({ indent }));
        }
        const listitem = new nodes.list_item(indented.join('\n'));
        if (indented) {
//          console.log('xnested parse');
            this.nestedParse(indented, {
 inputOffset: line_offset,
                                         node: listitem,
});
        }
        return [listitem, blank_finish];
    }

    enumerator(match, context, nextState) {
        /*"""Enumerated List Item"""*/
        const [ format, sequence, text, ordinal ] = this.parse_enumerator(match)
        if(!this.is_enumerated_list_item(ordinal, sequence, format)) {
            throw statemachine.TransitionCorrection('text')
	}
        const enumlist = new nodes.enumerated_list()
        this.parent.add(enumlist);
        if(sequence === '#') {
            enumlist.attributes['enumtype'] = 'arabic'
	} else {
            enumlist.attributes['enumtype'] = sequence
	}
        enumlist.attributes['prefix'] = this.enum.formatinfo[format].prefix // fixme check
        enumlist.attributes['suffix'] = this.enum.formatinfo[format].suffix
        if(ordinal !== 1) {
            enumlist.attributes['start'] = ordinal
            const msg = self.reporter.info(
                `Enumerated list start value not ordinal-1: "${text}" (ordinal ${ordinal})`, [], {});
            this.parent.add(msg);
	}
        let listitem;
        let blankFinish;
        [ listitem, blankFinish ] = this.list_item(match.result.index + match.result[0].length)
        enumlist.add(listitem)
        const offset = this.stateMachine.lineOffset + 1   // next line
            let newlineOffset;
         [ newlineOffset, blankFinish ] = this.nestedListParse(
            this.stateMachine.inputLines.slice(offset), {
		inputOffset: this.stateMachine.absLineOffset() + 1,
		node: enumlist, initialState: 'EnumeratedList',
		blankFinish,
		extraSettings: {'lastordinal': ordinal,
                               'format': format,
                               'auto': sequence === '#'}});
        this.gotoLine(newlineOffset)
        if(!blankFinish) {
            this.parent.add(this.unindent_warning('Enumerated list'));
	}
        return [[], nextState, []]
    }

    parse_enumerator(match, expected_sequence) {
	throw new Unimp();
    }

    field_marker(match,context,nextState) {
	const fieldList = new nodes.field_list();
	this.parent.add(fieldList);
	let field;
	let blankFinish;
	[field,blankFinish] = this.field(match);
	fieldList.add(field);
	const offset = this.stateMachine.lineOffset + 1
	let newlineOffset;
	[newlineOffset, blankFinish] = this.nestedListParse(
	    this.stateMachine.inputLines.slice(offset),
	    {
		inputOffset: this.stateMachine.absLineOffset() + 1,
		node:fieldList,
		initialState:'FieldList',
		blankFinish,
	    });
	this.gotoLine(newlineOffset);
	if(!blankFinish) {
	    this.parent.add(this.unindentWarning('Field list'));
	}
	return [[], nextState, []]
    }

    field(match) {
        const name = this.parse_field_marker(match)
        const [ src, srcline ] = this.stateMachine.getSourceAndLine()
        const lineno = this.stateMachine.absLineNumber()
        const [ indented, indent, lineOffset, blankFinish ] = 
              this.stateMachine.getFirstKnownIndented({ indent: match.result.index + match.result[0].length});
        const field_node = new nodes.field()
        field_node.source = src
        field_node.line = srcline
        const [ name_nodes, name_messages ] = this.inline_text(name, lineno)
        field_node.add(new nodes.field_name(name, '', name_nodes, {}));
        const field_body = new nodes.field_body(indented.join('\n'), name_messages, {})
        field_node.add(field_body)
        if(indented && indented.length) {
            this.parse_field_body(indented, lineOffset, field_body)
	}
        return [field_node, blankFinish]
    }
    
    parse_field_marker(match) {
        /*"""Extract & return field name from a field marker match."""*/
	console.log(match);
	let field = match.result[0].substring(1);
        field = field.substring(0, field.lastIndexOf(':'));
	return field;
    }

    parse_field_body(indented, offset, node) {
	this.nestedParse(indented, { inputOffset: offset, node: node })
    }

    option_marker( match, context, nextState) {
        //"""Option list item."""
        const optionlist = new nodes.option_list()
        const [ source, line ] = this.stateMachine.getSourceAndLine();
        let listitem;
        let blankFinish;
        try {
             [ listitem, blankFinish ] = this.option_list_item(match)
	}
	catch(error) {
	    if(error instanceof MarkupError) {
		// This shouldn't happen; pattern won't match.
		const msg = this.reporter.error(`Invalid option list marker: ${error}`);
		this.parent.add( msg )
		const [ indented, indent, line_offset, blankFinish ]  = 
                      this.stateMachine.getFirstKnownIndented({ indent: match.result.index + match.result[0].length });
		const elements = this.block_quote(indented, line_offset)
		this.parent.add(elements);
		if(!blankFinish) {
                    this.parent.add(this.unindentWarning('Option list'));
		}
		return [[], nextState, []]
	    }
	    throw error;
	}
        this.parent.add( optionlist)
        optionlist.add( listitem)
        const offset = this.stateMachine.lineOffset + 1   // next line
        const [ newline_offset, blankFinish2 ] = this.nestedListParse(
            this.stateMachine.inputLines.slice(offset),
	    {
		inputOffset: this.stateMachine.absLineOffset() + 1,
		node: optionlist,
		initialState: 'OptionList',
		blankFinish,
	    }
	);
        this.gotoLine(newline_offset)
        if(!blankFinish2) {
            this.parent.add(this.unindentWarning('Option list'));
	}
        return [[], nextState, []]
    }
    
    option_list_item(match) {
        const offset = this.stateMachine.absLineOffset()
        const options = this.parse_option_marker(match)
        const [ indented, indent, line_offset, blank_finish ] = 
              this.stateMachine.getFirstKnownIndented({ indent: match.result.index + match.result[0].length });
        if(!indented || !indented.length) {//  not an option list item
            this.gotoLine(offset)
            throw new statemachine.TransitionCorrection('text')
	}
        const option_group = new nodes.option_group('', options)
        const description = new nodes.description(indented.join('\n'));
        const option_list_item = new nodes.option_list_item('', [option_group,
								 description])
        if(indented && indented.length) {
            this.nestedParse(indented, { inputOffset: line_offset,
					 node: description });
	}
        return [ option_list_item, blank_finish ]
    }

    parse_option_marker(match) {
    /*"""
        Return a list of `node.option` and `node.option_argument` objects,
        parsed from an option marker match.

        :Exception: `MarkupError` for invalid option markers.
        """*/
        const optlist = []
        const optionstrings = match.result[0].trimEnd().split(', ');
        for(let optionstring of optionstrings) {
            const tokens = optionstring.split(/s+/)
            let delimiter = ' '
            const firstopt = tokens[0].split('=', 2)
            if(firstopt.length > 1) {
		// "--opt=value" form
		tokens.splice(0, 1, firstopt); // fixme check
                delimiter = '='
	    } else if(tokens[0].length > 2
		      && ((tokens[0].indexOf('-') === 0
			   && tokens[0].indexOf('--') !== 0)
			  || tokens[0].indexOf('+') === 0)) {
		//"-ovalue" form
		tokens.splice(0, 1, tokens[0].substring(0, 2), tokens[0].substring(2));
                delimiter = ''
	    }
            if(tokens.length > 1 && (tokens[1].startsWith('<')
                                     && tokens[-1].endsWith('>'))) {
		// "-o <value1 value2>" form; join all values into one token
                tokens.splice(1, tokens.length, tokens.slice(1).join(''));
	    }
	    if(0 < tokens.length <= 2) {
                const option = new nodes.option(optionstring)
                option.add(new nodes.option_string(tokens[0], tokens[0]))
                if(tokens.length > 1) {
                    option.add(new nodes.option_argument(tokens[1], tokens[1],
							 [], { delimiter }));
		}
                optlist.push(option)
	    }else {
                throw new MarkupError(`wrong number of option tokens (=${tokens.length}), should be 1 or 2: "${optionstring}"`);
	    }
	}
        return optlist
    }

    doctest(match, context, nextState) {
	const data = this.stateMachine.getTextBlock().join('\n');
	// TODO: prepend class value ['pycon'] (Python Console)
        // parse with `directives.body.CodeBlock` (returns literal-block
        // with class "code" and syntax highlight markup).
        this.parent.add(new nodes.doctest_block(data, data))
        return [[], nextState, []]
    }
    
    line(match, context, nextState) {
//      console.log(line);
        if (this.stateMachine.matchTitles) {
            return [[match.input], 'Line', []];
        } if (match.match.input.trim() == '::') {
            throw new statemachine.TransitionCorrection('text');
        } else if (match.match.input.trim().length < 4) {
            const msg = this.reporter.info(
                'Unexpected possible title overline or transition.\n'
                + "Treating it as ordinary text because it's so short.",
                { line: this.stateMachine.absLineNumber() },
);
            this.parent.add(msg);
            throw new statemachine.TransitionCorrection('text');
        } else {
            const blocktext = this.stateMachine.line;
            const msg = this.reporter.severe(
                  'Unexpected section title or transition.',
                [nodes.literal_block(blocktext, blocktext)],
                { line: this.stateMachine.absLineNumber() },
);
            this.parent.add(msg);
            return [[], next_state, []];
        }
    }


    text(match, context, nextState) {
        if (match.input === undefined) {
            throw new Error('');
        }

        return [[match.input], 'Text', []];
    }
}

export class Text extends RSTState {
    _init(args) {
        super._init(args);
        this.patterns = {
 underline: '([!-/:-@[-\`{-~])\\1* *$',
                         text: '',
};
        this.initialTransitions = [['underline', 'Body'], ['text', 'Body']];
    }

    blank(match, context, nextState) {
        const [paragraph, literalnext] = this.paragraph(context, this.stateMachine.absLineNumber() - 1);
        this.parent.add(paragraph);
        if (literalnext) {
            this.parent.add(this.literal_block());
        }

        return [[], 'Body', []];
    }

    eof(context) {
        if (context != null && !isIterable(context) || context.length > 0) {
            this.blank(null, context, null);
        }
        return [];
    }

    indent(match, context, nextState) {
        /*"""Definition list item."""*/
        const definitionlist = new nodes.definition_list()
        let blankFinish;
        let definitionlistitem;
        [ definitionlistitem, blankFinish ] = this.definition_list_item(context)
        definitionlist.add(definitionlistitem)
        this.parent.add(definitionlist)
        const offset = this.stateMachine.lineOffset + 1;
        let newlineOffset;
        [ newlineOffset, blankFinish ]  = this.nestedListParse(
            this.stateMachine.inputLines.slice(offset),
            { inputOffset: this.stateMachine.absLineOffset() + 1,
              node: definitionlist, initialState: 'DefinitionList',
              blankFinish, blankFinishState: 'Definition' });
        this.gotoLine(newlineOffset)
        if(!blankFinish)  {
            this.parent.add(this.unindentWarning('Definition list'))
	}
        return[ [], 'Body', []]
    }

    underline(match, context, nextState) {
	if(!Array.isArray(context)) {
	    throw new Error("Context should be array");
	}
        const lineno = this.stateMachine.absLineNumber();
        const title = context[0].trimRight();
        const underline = match.result.input.trimRight();
        const source = `${title}\n${underline}`;
        const messages = [];
        if (column_width(title) > underline.length) {
            if (underline.length < 4) {
                if (this.stateMachine.matchTitles) {
                    const msg = this.reporter.info(
                        'Possible title underline, too short for the title.\n'
                        + "Treating it as ordinary text because it's so short.", [], { line: lineno },
);
                    this.parent.add(msg);
                    throw new statemachine.TransitionCorrection('text');
                }
            } else {
                const blocktext = `${context[0]}\n${this.stateMachine.line}`;
                const msg = this.reporter.warning('Title underline too short.',
						  [new nodes.literal_block(blocktext, blocktext)], { line: lineno});
                messages.push(msg);
            }
        }
        if (!this.stateMachine.matchTitles) {
            const blocktext = `${context[0]}\n${this.stateMachine.line}`;
            // We need get_source_and_line() here to report correctly
            const [src, srcline] = this.stateMachine.getSourceAndLine();
            const msg = this.reporter.severe('Unexpected section title.',
                                             [new nodes.literal_block(blocktext, blocktext)], { source: src, line: srcline });
            this.parent.add(messages);
            this.parent.add(msg);
            return [], next_state, [];
        }
        const style = underline[0];
	context.length = 0;
        this.section({title, source, style, lineno: lineno - 1, messages});

        return [[], nextState, []];
    }

    text(match, context, nextState) {
        const startline = this.stateMachine.absLineNumber() - 1;
        let msg;
        let block;
        try {
            block = this.stateMachine.getTextBlock(undefined, true);
        } catch (error) {
            if (error instanceof statemachine.UnexpectedIndentationError) {
                let src; let
srcline;
                [block, src, srcline] = error.args;
                msg = this.reporter.error('Unexpected indentation.',
                                          { source: src, line: srcline });
            } else {
                throw error;
            }
        }
        const lines = [context, ...(block || [])];
        const [pelems, literalnext] = this.paragraph(lines, startline);
        this.parent.add(...pelems);
        // fixme this.parent.add(msg)
        if (literalnext) {
            try {
                this.stateMachine.nextLine();
            } catch (error) {
                if (error instanceof EOFError) {
                } else {
                    throw error;
                }
            }
            this.parent.add(this.literal_block());
        }
        return [[], nextState, []];
    }

    literal_block(match, context, nextState) {
        //"""Return a list of nodes."""
        const [ indented, indent, offset, blank_finish ] = this.stateMachine.getIndented({})
        while(indented && indented.length && !indented[indented.length - 1].trim()){
            indented.trimEnd()
	}
        if(!indented || !indented.length) {
            return this.quoted_literal_block()
	}
        const data = indented.join('\n')
        const literal_block = new nodes.literal_block(data, data)
            const [ source, line ] = this.stateMachine.getSourceAndLine(offset+1)
        literal_block.source = source;
         literal_block.line =  line;
        const nodelist = [literal_block]
        if(!blank_finish){
            nodelist.push(this.unindentWarning('Literal block'))
	}
        return nodelist
    }

    quoted_literal_block(match, context, nextState) {
        const absLineOffset = this.stateMachine.absLineOffset()
        const offset = this.stateMachine.lineOffset
	const parentNode = new nodes.Element()
        const newAbsOffset = this.nestedParse(
            this.stateMachine.inputLines.slice(offset),
            { inputOffset: absLineOffset,
	      node: parentNode,
	      matchTitles: false,
              stateMachineKwargs: {stateClasses: [QuotedLiteralBlock],
                                   initialState: 'QuotedLiteralBlock'}});
        this.gotoLine(newAbsOffset)
        return parentNode.children
    }

    definition_list_item(termline) {
        const [ indented, indent, line_offset, blank_finish ] = 
              this.stateMachine.getIndented({})
        const itemnode = new nodes.definition_list_item(
            [...termline, ...indented].join('\b'))
        const lineno = this.stateMachine.absLineNumber() - 1;
        [itemnode.source,
         itemnode.line] = this.stateMachine.getSourceAndLine(lineno)
        const [ termlist, messages ] = this.term(termline, lineno)
        itemnode.add(termlist)
        const definition = new nodes.definition('', messages)
        itemnode.add(definition);
        if(termline[0].endsWith('::')) {
            definition.add(this.reporter.info(
                'Blank line missing before literal block (after the "::")? '+
                    'Interpreted as a definition list item.',[],
                {line: lineno+1}))
	}
        this.nestedParse(indented, { inputOffset: line_offset, node: definition })
        return [ itemnode,blank_finish ]
    }

    term(lines, lineno) {
        const [ text_nodes, messages ] = this.inline_text(lines[0], lineno)
        const term_node = new nodes.term(lines[0])
   //     [term_node.source,
    //     term_node.line] = this.stateMachine.getSourceAndLine(lineno)
        const node_list = [term_node]
	text_nodes.forEach(node => {
            if(node instanceof nodes.Text) {
                const parts = node.astext().split(this.classifier_delimiter); //fixme
                if(parts.length === 1) {
                    node_list[node_list.length-1].add(node)
		} else {
                    const text = parts[0].trimRight()
                    const textnode = new nodes.Text(utils.unescape(text, true))
                    node_list[node_list.length-1].add(textnode)
                    for(let part of parts.slice(1)) {
                        node_list.push(
                            new nodes.classifier(unescape(part, false), part))
		    }
		}
	    } else {
                node_list[node_list.length-1].add(node)
	    }
	});
	return [node_list, messages]
    }
}
export class SpecializedText extends Text {
    _init(args) {
        super._init(args);
	if(!this.blank) {
            this.blank = this.invalidInput;
	}
	if(!this.indent) {
            this.indent = this.invalidInput;
	}
	if(!this.underline) {
            this.underline = this.invalidInput;
	}
	if(!this.text) {
            this.text = this.invalidInput;
	}
    }

    eof() {
        return [];
    }

    invalidInput() {
	console.log('invalid input, throwing eoferror');
        throw new EOFError();
    }
}

export class Definition extends SpecializedText {
    eof(context) {
	this.stateMachine.previousLine(2);
	return []
    }
    indent(match,context, nextState) {
	const [itemNode, blankFinish ] = this.definition_list_item(context);
	this.parent.add(itemNode);
	this.blankFinish = blankFinish;
	return [[], 'DefinitionList', []]
    }
}



export class Line extends SpecializedText {
    _init(args) {
        super._init(args);
        this.eofcheck = 1;
    }

    eof(context) {
        const marker = context[0].trim();
        if (this.memo.sectionBubbleUpKludge) {
            this.memo.sectionBubbleUpKludge = false;
        } else if (marker.length < 4) {
            this.stateCorrection(context);
        }
        if (this.eofcheck) {
            const lineno = this.stateMachine.absLineNumber() - 1;
            const transition = new nodes.transition(context[0]);
            transition.line = lineno;
            this.parent.add(transition);
        }
        this.eofcheck = 1;
        return [];
    }

    blank(match, context, nextState) {
        /*"""Transition marker."""*/
        const [src, srcline ]  = this.stateMachine.getSourceAndLine()
        const marker = context[0].trim()
        if(marker.length < 4) {
            this.stateCorrection(context)
	}
        const transition = new nodes.transition(marker)
        transition.source = src
        transition.line = srcline - 1
        this.parent.add(transition)
        return [[], 'Body', []]
    }

    text(match, context, nextState) {
        /*"""Potential over- & underlined title."""*/
        const lineno = this.stateMachine.absLineNumber() - 1
        let overline = context[0]
        let title = match.match.input
        let underline = ''
        try {
            underline = this.stateMachine.nextLine()
	} catch(error) {
	    if(error instanceof EOFError) {
		const blocktext = overline + '\n' + title
		if(overline.trimEnd().length < 4) {
                    this.short_overline(context, blocktext, lineno, 2)
		} else {
                    const msg = this.reporter.severe(
			'Incomplete section title.',
			[new nodes.literal_block(blocktext, blocktext)],
			{ line: lineno})
                    this.parent.add(msg)
                    return [[], 'Body', []]
		}
	    } else {
		throw error;
	    }
	}
	const source = [overline, title, underline].join('\n');
	overline = overline.trimEnd();
	underline = underline.trimEnd();
	if(!this.transitions.underline[0].test(underline)) {
	    const blocktext = overline + '\n' + title + '\n' + underline;
            if(overline.trimEnd().length < 4) {
                this.short_overline(context, blocktext, lineno, 2)
	    } else {
                const msg = this.reporter.severe(
                    'Missing matching underline for section title overline.',
                    [nodes.literal_block(source, source)],
                    { line: lineno })
                this.parent.add(msg);
                return [[], 'Body', []]
	    }
	} else if(overline !== underline) {
            const blocktext = overline + '\n' + title + '\n' + underline
            if(overline.trimEnd().length < 4) {
                this.short_overline(context, blocktext, lineno, 2)
	    } else {
                const msg = this.reporter.severe(
                    'Title overline & underline mismatch.',
                    [nodes.literal_block(source, source)],
                    { line: lineno });
                this.parent.add(msg)
                return [[], 'Body', []]
	    }
	}
	title = title.rstrip()
        const messages = []
        if(column_width(title) > overline.length) {
            const blocktext = overline + '\n' + title + '\n' + underline
            if(overline.trimEnd().length() < 4) {
                this.short_overline(context, blocktext, lineno, 2)
	    } else {
                const msg = this.reporter.warning(
                    'Title overline too short.',
                    [nodes.literal_block(source, source)],
                    { line: lineno })
                messages.push(msg)
	    }
	}
        const style = [overline[0], underline[0]]
        this.eofcheck = 0               // @@@ not sure this is correct
        this.section({ title: title.trimStart(), source, style, lineno: lineno + 1, messages});
        this.eofcheck = 1
        return [[], 'Body', []]

    }

    underline(match, context, nextState) {
        const overline = context[0]
        const blocktext = overline + '\n' + this.stateMachine.line
        const lineno = this.stateMachine.absLineNumber() - 1
        if(overline.trimEnd().length < 4) {
            this.short_overline(context, blocktext, lineno, 1)
	}
        const msg = this.reporter.error(
	    'Invalid section title or transition marker.',
	    [nodes.literal_block(blocktext, blocktext)],
	    {line: lineno})
        this.parent.add(msg)
        return [[], 'Body', []]
    }

    shortOverline(context, blocktext, lineno, lines = 1) {
        const msg = this.reporter.info(
            'Possible incomplete section title.\nTreating the overline as '+
            "ordinary text because it's so short.", [],
            { line: lineno})
        this.parent.add(msg);
        this.state_correction(context, lines)
    }

    stateCorrection(context, lines = 1) {
        this.stateMachine.previousLine(lines)
        context.length = 0;
	throw new statemachine.StateCorrection('Body', 'text')
    }
}

export class SpecializedBody extends Body {
    _init(args) {
	super._init(args);
    }

    indent() {
	this.invalid_input();
    }

    bullet() {
	this.invalid_input();
    }

    enumerator() {
	this.invalid_input();
    }
    field_marker() {
	this.invalid_input();
    }
    option_marker() {
	this.invalid_input();
    }
    doctest() {
	this.invalid_input();
    }
    line_block() {
	this.invalid_input();
    }
    grid_table_top() {
	this.invalid_input();
    }
    simple_table_top() {
	this.invalid_input();
    }
    explicit_markup() {
	this.invalid_input();
    }
    anonymous() {
	this.invalid_input();
    }
    line() {
	this.invalid_input();
    }
    text() {
	this.invalid_input();
    }

    invalid_input(match, context, nextState) {
	this.stateMachine.previousLine();
	throw new EOFError();
    }
}

export class BulletList extends SpecializedBody {
    bullet(match, context, nextState) {
        if (match.result.input[0] !== this.parent.attributes.bullet) {
            this.invalidInput();
        }
        const [listitem, blankFinish] = this.list_item(match.result.index + match.result[0].length);
        this.parent.add(listitem);
        this.blankFinish = blankFinish;
        return [[], nextState, []];
    }
}

export class DefinitionList extends SpecializedBody {
    text(match, context, nextState) {
	return [[match.result.input], 'Definition', []]
    }
}

class EnumeratedList extends SpecializedBody {
    /*"""Second and subsequent enumerated_list list_items."""*/
    enumerator(match, context, nextState) {
        /*"""Enumerated list item."""*/
        const [ format, sequence, text, ordinal ] = this.parse_enumerator(
            match, self.parent.attributes['enumtype'])
        if (( format !== self.format
              || (sequence !== '#' && (sequence !== self.parent.attributes['enumtype']
                                       || self.auto// fxme
                                       || ordinal !== (this.lastordinal + 1)))
              || !this.is_enumerated_list_item(ordinal, sequence, format))) {
	    //# different enumeration: new list
            this.invalid_input()
	}
        if(sequence === '#') {
	    this.auto = 1
	}
        const [listitem, blank_finish ] = new self.list_item(match.result.index + match.result[0].length)
        this.parent.add(listitem)
        this.blankFinish = blank_finish
        this.lastordinal = ordinal
        return [[], next_state, []]
    }
}

class FieldList extends SpecializedBody {
/*    """Second and subsequent field_list fields."""*/

    field_marker(match, context, next_state) {
        /*"""Field list field."""*/
        const [ field, blank_finish ] = this.field(match)
        this.parent.add(field);
        this.blankFinish = blank_finish
        return [[], next_state, []]
    }
}

export class OptionList extends SpecializedBody {
/*
    """Second and subsequent option_list option_list_items."""
*/
    option_marker( match, context, nextState) {
        //"""Option list item."""
	let option_list_item;
	let blank_finish;
        try {
            [ option_list_item, blank_finish ] = this.option_list_item(match)
	} catch(error) {
	    if(error instanceof MarkupError) {
		this.invalid_input();
	    }
	    throw error;
	}
        this.parent.add(option_list_item)
        this.blankFinish = blank_finish
        return [[], nextState, []]
    }
}

export const stateClasses = [Body, BulletList, Text, Line, DefinitionList, Definition, FieldList, OptionList];

/*    underline(match, context, nextState) {
        const overline = context[0]
        const blocktext = overline + '\n' + this.stateMachine.line
        const lineno = this.stateMachine.absLineNumber() - 1
//        if len(overline.rstrip()) < 4:
//            self.short_overline(context, blocktext, lineno, 1)
        const msg = this.reporter.error(
              'Invalid section title or transition marker.',
            [new nodes.literal_block(blocktext, blocktext)],
            { line: lineno })
        self.parent.add(msg)
        return [[], 'Body', []]
    }
*/
