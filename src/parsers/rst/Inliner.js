import * as nodes from '../../nodes';
import {
 isIterable, getTrimFootnoteRefSpace, splitEscapedWhitespace, escape2null,
} from '../../utils';
import { matchChars } from '../../utils/punctuationChars';
import roleInterface from './Roles';
import { ApplicationError } from '../../Exceptions';
import unescape from '../../utils/unescape';

/* eslint-disable-next-line no-unused-vars */
const __docformat__ = 'reStructuredText';

const uric = '[-_.!~*\'()[\\];/:@&=+$,%a-zA-Z0-9\\x00]';
// # Delimiter indicating the end of a URI (not part of the URI):
const uriEndDelim = '[>]';
const urilast = '[_~*/=+a-zA-Z0-9]';
const uriEnd = `(?:${urilast}|${uric}(?=${uriEndDelim}))`;
const emailc = '[-_!~*\'{|}/#?^`&=+$%a-zA-Z0-9\\x00]';
const emailPattern = `${emailc}+(?:\\.${emailc}+)*(?<!\x00)@${emailc}+(?:\\.${emailc}*)*%(uriEnd)s`;
// email=re.compile(self.email_pattern % args + '$',
//                 re.VERBOSE | re.UNICODE),

function buildRegexp(definition, compile = true) {
    const [fakeTuple, name, prefix, suffix, parts] = definition;
    let myPrefix = prefix.slice();
    let mySuffix = suffix.slice();
    const myParts = parts.slice();
    let prefixNames = [];
    if (Array.isArray(myPrefix)) {
        myPrefix.shift();
        const pr = myPrefix.shift();
        prefixNames = [...myPrefix];
        myPrefix = pr;
    }
    /* istanbul ignore if */
    if (mySuffix === undefined) {
        throw new Error();
    }
    let suffixNames = [];
    if (Array.isArray(mySuffix)) {
        mySuffix.shift();
        const sr = mySuffix.shift();
        suffixNames = [...mySuffix];
        mySuffix = sr;
    }

    /* istanbul ignore if */
    if (!fakeTuple) {
        throw new Error();
    }
    //    console.log(`buildRegexp(${name} - ${pi})`);
    const partStrings = [];
    //    console.log(parts);
    /* istanbul ignore if */
    if (myParts === undefined) {
        throw new Error();
    }
    myParts.shift(); /* Remove 'faketuple' */
    const groupNames = [];
    myParts.forEach((part) => {
        const fakeTuple3 = Array.isArray(part) ? part[0] : undefined;
        if (fakeTuple3 === 1) {
            const [regexp, subGroupNames] = buildRegexp(part, null);
            groupNames.push(null, ...subGroupNames);
            partStrings.push(regexp);
        } else if (fakeTuple3 === 2) {
            const myPart = part.slice();
            myPart.shift();
            const regexp = myPart.shift();
            partStrings.push(regexp);
            groupNames.push(null, ...myPart);
        } else {
            partStrings.push(part);
            groupNames.push(null);
        }
    });
    const orGroup = partStrings.map(x => `(${x})`).join('|');
    const regexp = `${myPrefix}(${orGroup})${mySuffix}`;
    //    console.log(new RegExp(regexp))
    groupNames.splice(0, 0, ...prefixNames, name);

    groupNames.push(...suffixNames);
    //    console.log('groupnames')
    //    console.log(groupNames);
    //    console.log(`regexp is ${regexp}`);
    if (compile) {
        return [new RegExp(regexp), groupNames, regexp];
    }

    return [regexp, groupNames];
}

/*
 *    Parse inline markup; call the `parse()` method.
 *
 */
class Inliner {
    /**
     * Create Inliner instance
     */
    constructor() {
        this.dispatch = {
            '*': this.emphasis.bind(this),
            '**': this.strong.bind(this),
            '``': this.literal.bind(this),
            '`': this.interpreted_or_phrase_ref.bind(this),
            '_`': this.inline_internal_target.bind(this),
            _: this.reference.bind(this),
            ']_': this.footnote_reference.bind(this),
            '|': this.substitution_reference.bind(this),
            __: this.anonymous_reference.bind(this),
        };
        /*
         */

        this.implicitDispatch = [];
        this.nonWhitespaceAfter = '';
        this.nonWhitespaceBefore = '(?<!\\s)';
        this.nonWhitespaceEscapeBefore = '(?<![\\s\\x00])';

        this.nonUnescapedWhitespaceEscapeBefore = '(?<!(?<!\\x00)[\\s\\x00])';
    }

    /* eslint-disable-next-line camelcase */
    inline_internal_target(match, lineno) {
        const [before, inlines, remaining,
               /* eslint-disable-next-line no-unused-vars */
               sysmessages, endstring] = this.inline_obj(match,
                                                         lineno,
                                                         this.patterns.target,
                                                         nodes.target);
        if (inlines && inlines.length && inlines[0] instanceof nodes.target) {
            // assert len(inlines) == 1
            const target = inlines[0];
            const name = nodes.fullyNormalizeName(target.astext());
            target.attributes.names.push(name);
            this.document.noteExplicitTarget(target, this.parent);
        }
        return [before, inlines, remaining, sysmessages];
    }

    /* eslint-disable-next-line camelcase */
    substitution_reference(match, lineno) {
        const [before, inlines, remaining, sysmessages, endstring] = this.inline_obj(
            match, lineno, this.patterns.substitution_ref,
            nodes.substitution_reference,
        );
        if (inlines.length === 1) {
            const subrefNode = inlines[0];
            if (subrefNode instanceof nodes.substitution_reference) {
                const subrefText = subrefNode.astext();
                this.document.noteSubstitutionRef(subrefNode, subrefText);
                if (endstring[endstring.length - 1] === '_') {
                    const referenceNode = new nodes.reference(
                        `|${subrefText}${endstring}`, '',
                    );
                    if (endstring.endsWith('__')) {
                        referenceNode.attributes.anonymous = 1;
                    } else {
                        referenceNode.attributes.refname = nodes.fullyNormalizeName(subrefText);
                        this.document.note_refname(referenceNode);
                    }
                    referenceNode.add(subrefNode);
                    inlines[0] = referenceNode;
                }
            }
        }
        return [before, inlines, remaining, sysmessages];
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    footnote_reference(match, lineno) {
        //        console.log(`in footnote_reference : ${match.result}`);
        const label = match.groups.footnotelabel;
        let refname = nodes.fullyNormalizeName(label);
        const string = match.result.input;
        let before = string.substring(0, match.result.index);
        const remaining = string.substring(match.result.index + match.result[0].length);
        let refnode;
        if (match.groups.citationlabel) {
            refnode = new nodes.citation_reference(`[${label}]_`, '', [],
                                                   { refname });
            refnode.add(new nodes.Text(label));
            this.document.noteCitationRef(refnode);
        } else {
            refnode = new nodes.footnote_reference(`[${label}]_`);
            if (refname[0] === '#') {
                refname = refname.substring(1);
                refnode.attributes.auto = 1;
                this.document.noteAutofootnoteRef(refnode);
            } else if (refname === '*') {
                refname = '';
                refnode.attributes.auto = '*';
                this.document.noteSymbolFootnoteRef(
                    refnode,
                );
            } else {
                refnode.add(new nodes.Text(label));
            }
            if (refname) {
                refnode.attributes.refname = refname;
                this.document.noteFootnoteRef(refnode);
            }
            if (getTrimFootnoteRefSpace(this.document.settings)) {
                before = before.trimRight();
            }
        }
        return [before, [refnode], remaining, []];
    }

    reference(match, lineno, anonymous = false) {
        const referencename = match.groups.refname;
        const refname = nodes.fullyNormalizeName(referencename);
        const referencenode = new nodes.reference(
            referencename + match.groups.refend, referencename,
            [],
            { name: nodes.whitespaceNormalizeName(referencename) },
        );
        referencenode.children[0].rawsource = referencename;
        if (anonymous) {
            referencenode.attributes.anonymous = 1;
        } else {
            referencenode.attributes.refname = refname;
            this.document.noteRefname(referencenode);
        }
        const string = match.result.input;
        const matchstart = match.result.index;
        const matchend = match.result.index + match.result[0].length;
        return [string.substring(0, matchstart), [referencenode], string.substring(matchend), []];
    }

    /* eslint-disable-next-line camelcase */
    anonymous_reference(match, lineno) {
        return this.reference(match, lineno, true);
    }

    problematic(text, rawsource, message) {
        const msgid = this.document.setId(message, this.parent);
        const problematic = new nodes.problematic(rawsource, text, [], { refid: msgid });
        const prbid = this.document.setId(problematic);
        message.addBackref(prbid);
        return problematic;
    }

    emphasis(match, lineno) {
        const [before, inlines, remaining,
               /* eslint-disable-next-line no-unused-vars */
               sysmessages, endstring] = this.inline_obj(
                   match, lineno, this.patterns.emphasis, nodes.emphasis,
               );
        return [before, inlines, remaining, sysmessages];
    }

    strong(match, lineno) {
        const [before, inlines, remaining,
               /* eslint-disable-next-line no-unused-vars */
               sysmessages, endstring] = this.inline_obj(match,
                                                         lineno,
                                                         this.patterns.strong,
                                                         nodes.strong);
        return [before, inlines, remaining, sysmessages];
    }

    /* eslint-disable-next-line camelcase */
    interpreted_or_phrase_ref(match, lineno) {
        const endPattern = this.patterns.interpreted_or_phrase_ref;
        const string = match.match.input;
        // console.log(match.groups);
        const matchstart = match.match.index;
        const matchend = matchstart + match.match[0].length;
        const rolestart = matchstart;
        let role = match.groups.role;
        let position = '';
        if (role) {
            role = role.substring(1, role.length - 1);
            position = 'prefix';
        } else if (this.quoted_start(match)) {
            return [string.substring(0, matchend), [], string.substring(matchend), []];
        }
        const endmatch = endPattern.exec(string.substring(matchend));
        if (endmatch && endmatch[1].length) {
            const textend = matchend + endmatch.index + endmatch[0].length;
            if (endmatch[3]) {
                if (role) {
                    const msg = this.reporter.warning(
                        'Multiple roles in interpreted text (both '
                            + 'prefix and suffix present; only one allowed).',
                        [], { line: lineno },
                    );
                    const text = unescape(string.substring(rolestart, textend), true);
                    const prb = this.problematic(text, text, msg);
                    return [string.substring(0, rolestart), [prb],
                            string.substring(textend), [msg]];
                }
                role = endmatch[3];
                role = role.substring(1, role.length - 1);
                position = 'suffix';
            }
            const escaped = endmatch.input.substring(0, endmatch.index);
            let rawsource = unescape(string.substring(matchstart, textend), true);
            if (rawsource[rawsource.length - 1] === '_') {
                if (role) {
                    const msg = this.reporter.warning(
                        `Mismatch: both interpreted text role ${position} and `
                            + 'reference suffix.', [], { line: lineno },
                    );
                    const text = unescape(string.substring(rolestart, textend), true);
                    const prb = this.problematic(text, text, msg);
                    return [string.substring(0, rolestart), [prb],
                            string.substring(textend), [msg]];
                }
                return this.phrase_ref(string.substring(0, matchstart),
                                       string.substring(textend), rawsource,
                                       escaped, unescape(escaped));
            }
            rawsource = unescape(string.substring(rolestart, textend), true);
            const [nodelist, messages] = this.interpreted(rawsource,
                                                          escaped, role,
                                                          lineno);
            return [string.substring(0, rolestart), nodelist,
                    string.substring(textend), messages];
        }
        const msg = this.reporter.warning(
            'Inline interpreted text or phrase reference start-string '
                + 'without end-string.', [], { line: lineno },
        );
        const text = unescape(string.substring(matchstart, matchend), true);
        const prb = this.problematic(text, text, msg);
        return [string.substring(0, match.match.index), [prb], string.substring(matchend), [msg]];
    }

    /* eslint-disable-next-line camelcase */
    phrase_ref(before, after, rawsource, escaped, text) {
        const match = this.patterns.embedded_link.exec(escaped);
        let aliastype;
        let aliastext;
        let rawaliastext;
        let rawtext;
        let alias;
        let target;
        let aliasParts;
        if (!rawsource) {
            rawsource = '';
        }
        if (match) { // # embedded <URI> or <alias_>
            text = unescape(escaped.substring(0, match.index));
            rawtext = unescape(escaped.substring(0, match.index), true);
            aliastext = unescape(match[2]);
            rawaliastext = unescape(match[2], true);
            const underscoreEscaped = rawaliastext.endsWith('\\_');
            if (aliastext.endsWith('_') && !(underscoreEscaped
                                             || this.patterns.uri.exec(aliastext))) {
                aliastype = 'name';
                alias = nodes.fullyNormalizeName(aliastext.substring(0, aliastext.length - 1));
                target = new nodes.target(match[1], '', [], { refname: alias });
                target.indirectReferenceName = aliastext.substring(0, aliastext.length - 1);
            } else {
                aliastype = 'uri';
                aliasParts = splitEscapedWhitespace(match[2]);
                /* this behaves differently from python's split with no args */
                alias = aliasParts.map(part => unescape(part).split(/\s+/).join('')).join(' ');
                //                console.log(`alias is ${alias}`);
                alias = this.adjustUri(alias);
                if (alias.endsWith('\\_')) {
                    alias = `${alias.substring(0, alias.length - 2)}_`;
                }
                target = new nodes.target(match[1], '', [], { refuri: alias });
                target.referenced = 1; //  1 or truE???
            }
            if (!aliastext) {
                throw new ApplicationError(`problem with embedded link: ${aliastext}`);
            }
            if (!text) {
                text = alias;
                rawtext = rawaliastext;
            }
        } else {
            target = null;
            rawtext = unescape(escaped, true);
        }

        const refname = nodes.fullyNormalizeName(text);
        const reference = new nodes.reference(rawsource, text, [],
                                              { name: nodes.whitespaceNormalizeName(text) });
        reference.children[0].rawsource = rawtext;
        const nodeList = [reference];

        if (rawsource.endsWith('__')) {
            if (target && (aliastype === 'name')) {
                reference.attributes.refname = alias;
                this.document.noteRefname(reference);
                // commented out in docutils.
                // # self.document.note_indirect_target(target) # required?
            } else if (target && (aliastype === 'uri')) {
                reference.attributes.refuri = alias;
            } else {
                reference.attributes.anonymous = 1;
            }
        } else if (target) {
            target.attributes.names.push(refname);
            if (aliastype === 'name') {
                reference.attributes.refname = alias;
                this.document.noteIndirectTarget(target);
                this.document.noteRefname(reference);
            } else {
                reference.attributes.refuri = alias;
                this.document.noteExplicitTarget(target, this.parent);
                // original source commented out
                // # target.note_referenced_by(name=refname)
            }
            nodeList.push(target);
        } else {
            reference.attributes.refname = refname;
            this.document.noteRefname(reference);
        }
        return [before, nodeList, after, []];
    }

    /* eslint-disable-next-line camelcase */
    quoted_start(match) {
        /* """Test if inline markup start-string is 'quoted'.

           'Quoted' in this context means the start-string is enclosed in a pair
           of matching opening/closing delimiters (not necessarily quotes)
           or at the end of the match.
           """ */
        const string = match.result.input;
        const start = match.result.index;
        if (start === 0) { // start-string at beginning of text
            return false;
        }
        let poststart;
        const prestart = string[start - 1];
        try {
            poststart = string.substr(match.result.index + match.result[0].length, 1);
        } catch (error) {
            //            console.log(error.constructor.name);
            return true; // not "quoted" but no markup start-string either
        }
        return matchChars(prestart, poststart);
    }

    /* eslint-disable-next-line camelcase */
    inline_obj(match, lineno, endPattern, nodeclass,
               restore_backslashes = false) {
        /* istanbul ignore if */
        if (typeof nodeclass !== 'function') {
            throw new Error();
        }

        /* istanbul ignore if */
        if (!(endPattern instanceof RegExp)) {
            throw new Error('');
        }

        //      console.log(match);
        const string = match.match.input;
        const matchstart = string.indexOf(match.groups.start);
        /* istanbul ignore if */
        if (matchstart === -1) {
            throw new Error('');
        }

        const matchend = matchstart + match.groups.start.length;
        //      console.log(`${matchstart} ${matchend}`);
        if (this.quoted_start(match)) {
            return [string.substring(0, matchend), [], string.substring(matchend), [], ''];
        }
        //      console.log(endPattern);
        const endmatch = endPattern.exec(string.substring(matchend));
        let text; let
        rawsource;
        if (endmatch && endmatch.index) { // 1 or more chars
            const _text = endmatch.input.substring(0, endmatch.index);
            text = unescape(_text, restore_backslashes);
            // this may not work for all situations
            const textend = matchend + endmatch.index + endmatch[0].length;
            rawsource = unescape(string.substring(matchstart, textend), true);
            const node = new nodeclass(rawsource, text);
            node.children[0].rawsource = unescape(_text, true);
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
        /* eslint-disable-next-line no-unused-vars */
        let ssn; let
        /* eslint-disable-next-line no-unused-vars */
        esn;
        if (settings.characterLevelInlineMarkup) {
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
        //      this.simplename = '(?:(?!_)\\w)+(?:[-._+:](?:(?!_)\\w)+)*' // fixme
        this.simplename = '\\w+';

        //        const prefix = startStringPrefix;
        //        const suffix = endStringSuffix;
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
            interpreted_or_phrase_ref: new RegExp(`${this.nonUnescapedWhitespaceEscapeBefore}(\`((:${this.simplename}:)?(__?)?))${endStringSuffix}`),
            embedded_link: new RegExp(`((?:[ \\n]+|^)<${this.nonWhitespaceAfter}(([^<>]|\\x00[<>])+)${this.nonWhitespaceEscapeBefore}>)$`),
            literal: new RegExp(`${this.nonWhitespaceBefore}(\`\`)${endStringSuffix}`),
            target: new RegExp(`${this.nonWhitespaceEscapeBefore}(\`)${endStringSuffix}`),
            substitution_ref: new RegExp(`${this.nonWhitespaceEscapeBefore
                                          }(\\|_{0,2})${
                                          endStringSuffix}`),
            email: new RegExp(emailPattern), // fixme % args + '$',
            // re.VERBOSE | re.UNICODE),
            uri: new RegExp(`${startStringPrefix}((([a-zA-Z][a-zA-Z0-9.+-]*):(((//?)?${uric}*${uriEnd})(\\?${uric}*${uriEnd})?(\\#${uriEnd})?))|(${emailPattern}))${endStringSuffix}`),
            /*          pep=re.compile(
                        r"""
                        %(start_string_prefix)s
                        (
                        (pep-(?P<pepnum1>\d+)(.txt)?) # reference to source file
                        |
                        (PEP\s+(?P<pepnum2>\d+))      # reference by name
                        )
                        %(end_string_suffix)s""" % args, re.VERBOSE | re.UNICODE),
                        rfc=re.compile(
                        r"""
                        %(start_string_prefix)s
                        (RFC(-|\s+)?(?P<rfcnum>\d+))
                        %(end_string_suffix)s""" % args, re.VERBOSE | re.UNICODE)) */

        };
        // console.log(this.patterns.initial);
    }

    parse(text, { lineno, memo, parent }) {
        this.reporter = memo.reporter;
        this.document = memo.document;
        this.language = memo.language;
        this.parent = parent;
        let remaining = escape2null(text);
        const processed = [];
        let unprocessed = [];
        const messages = [];
        while (remaining) {
            const match = this.patterns.initial[0].exec(remaining);
            //          console.log(match);
            if (match) {
                const rr = {};

                this.patterns.initial[1].forEach((x, index) => {
                    if (x != null) {
                        rr[x] = match[index];
                    }
                });
                const mname = rr.start || rr.backquote || rr.refend || rr.fnend;
                const method = this.dispatch[mname];
                /* istanbul ignore if */
                if (typeof method !== 'function') {
                    throw new Error(`Invalid dispatch ${mname}`);
                }
                let before; let inlines; let
                sysmessages;
                //              console.log(`name is ${mname}`);

                [before, inlines, remaining, sysmessages] = method(
                    { result: match, match, groups: rr }, lineno,
                );
                unprocessed.push(before);
                /* istanbul ignore if */
                if (!isIterable(sysmessages)) {
                    throw new Error(`Expecting iterable, got ${sysmessages}`);
                }
                messages.push(...sysmessages);
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

    /* eslint-disable-next-line camelcase,no-unused-vars */
    implicit_inline(text, lineno) {
        /*
          Check each of the patterns in `self.implicit_dispatch` for a match,
          and dispatch to the stored method for the pattern.  Recursively check
          the text before and after the match.  Return a list of `nodes.Text`
          and inline element nodes.
        */
        if (!text) {
            return [];
        }

        /*        for pattern, method in self.implicit_dispatch:
                  match = pattern.search(text)
                  if match:
                  try:
                  # Must recurse on strings before *and* after the match;
                  # there may be multiple patterns.
                  return (self.implicit_inline(text[:match.start()], lineno)
                  + method(match, lineno) +
                  self.implicit_inline(text[match.end():], lineno))
                  except MarkupMismatch:
                  pass
        */
        return [new nodes.Text(unescape(text), unescape(text, true))];
    }

    adjustUri(uri) {
        return uri; // fixme
    }
    /*
    //console.log(uri);
    const match = this.patterns.email.exec(uri)
    if(match) {
    return 'mailto:' + uri
    } else {
    return uri
    }
    } */

    interpreted(rawsource, text, role, lineno) {
        const [roleFn, messages] = roleInterface(role, this.language, lineno, this.reporter);
        if (roleFn) {
            const [theNodes, messages2] = roleFn.invoke(role, rawsource, text, lineno, this);
            try {
                theNodes[0].children[0].rawsource = unescape(text, true);
            } catch (error) {
                /* istanbul ignore if */
                if (!(error instanceof TypeError)) {
                    throw error;
                }
            }
            return [theNodes, [...messages, ...messages2]];
        }
        const msg = this.reporter.error(
            `Unknown interpreted text role "${role}".`, [],
            { line: lineno },
        );
        return [[this.problematic(rawsource, rawsource, msg)],
                [...messages, msg]];
    }

    literal(match, lineno) {
        /* eslint-disable-next-line no-unused-vars */
        const [before, inlines, remaining, sysmessages, endstring] = this.inline_obj(
            match, lineno, this.patterns.literal, nodes.literal, true,
        );
        return [before, inlines, remaining, sysmessages];
    }
}

export default Inliner;
