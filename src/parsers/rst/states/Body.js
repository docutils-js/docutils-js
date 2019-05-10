import RSTState from './RSTState';
import * as RegExps from '../RegExps';
import * as nodes from '../../../nodes';
import MarkupError from '../MarkupError';
import { escape2null, isIterable, splitEscapedWhitespace } from '../../../utils';
import StringList from '../../../StringList';
import * as tableparser from '../tableparser';
import { ApplicationError, UnimplementedError as Unimp } from '../../../Exceptions';
import TransitionCorrection from '../../../TransitionCorrection';
import * as directives from '../directives';
import UnexpectedIndentationError from '../../../UnexpectedIndentationError';

const fullyNormalizeName = nodes.fullyNormalizeName;

const nonWhitespaceEscapeBefore = RegExps.nonWhitespaceEscapeBefore;
const simplename = RegExps.simplename;

/* istanbul ignore next */
function _LoweralphaToInt() {
}

/* istanbul ignore next */
function _UpperalphaToInt() {
}

/* istanbul ignore next */
function _LowerromanToInt() {
}

/* istanbul ignore next */
function _UpperromanToInt() {
}

class Body extends RSTState {
    constructor(args) {
        super(args);
        const pats = { };

        pats.nonalphanum7bit = '[!-/:-@[-`{-~]';
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
                       loweralpha: _LoweralphaToInt,

            upperalpha: _UpperalphaToInt,
                       lowerroman: _LowerromanToInt,
                            upperroman: _UpperromanToInt,
};

        enum_.sequenceregexps = {};
        enum_.sequences.forEach((sequence) => {
            enum_.sequenceregexps[sequence] = new RegExp(`${enum_.sequencepats[sequence]}$`);
        });
        this.enum = enum_;

        this.gridTableTopPat = new RegExp('\\+-[-+]+-\\+ *$');
        this.simpleTableTopPat = new RegExp('=+( +=+)+ *$');

        const pats = {};
        pats.nonalphanum7bit = '[!-/:-@[-`{-~]';
        pats.alpha = '[a-zA-Z]';
        pats.alphanum = '[a-zA-Z0-9]';
        pats.alphanumplus = '[a-zA-Z0-9_-]';
        pats.enum = '';// ('(%(arabic)s|%(loweralpha)s|%(upperalpha)s|%(lowerroman)s' +'|%(upperroman)s|#)' % enum.sequencepats)
        pats.optname = `${pats.alphanum}${pats.alphanumplus}*`;
        pats.optarg = `(${pats.alpha}${pats.alphanumplus}*|<[^<>]+>)`;
        pats.shortopt = `(-|\\+)${pats.alphanum}( ?${pats.optarg})?`;
        pats.longopt = `(--|/)${pats.optname}([ =]${pats.optarg})?`;
        pats.option = `(${pats.shortopt}|${pats.longopt})`;

        enum_.formats.forEach((format) => {
            pats[format] = `(${
                [enum_.formatinfo[format].prefix,
                 pats.enum,
                 enum_.formatinfo[format].suffix].join('')})`;
        });

        this.patterns = {
            bullet: '[-+*\\u2022\\u2023\\u2043]( +|$)',
            enumerator: `(${pats.parens}|${pats.rparen}|${pats.period})( +|$)`,
            field_marker: ':(?![: ])([^:\\\\]|\\\\.|:(?!([ `]|$)))*(?<! ):( +|$)',
            grid_table_top: this.gridTableTopPat,
            option_marker: `${pats.option}(, ${pats.option})*(  +| ?$)`,
            doctest: '>>>( +|$)',
            line_block: '\\|( +|$)',
            simple_table_top: this.simpleTableTopPat,
            explicit_markup: '\\.\\.( +|$)',
            anonymous: '__( +|)',
            line: `(${pats.nonalphanum7bit})\\1* *$`,
            text: '',
        };
//      console.log(this.enumerator);

        this.initialTransitions = ['bullet', 'enumerator', 'field_marker', 'option_marker', 'doctest', 'line_block', 'grid_table_top', 'simple_table_top', 'explicit_markup', 'anonymous', 'line', 'text'];

        this.explicit = {};
        this.explicit.patterns = {
            target: new RegExp(`^(_|(?!_)(\`?)(?![ \`])(.+?)${nonWhitespaceEscapeBefore})(?<!(?<!\\x00):)${nonWhitespaceEscapeBefore}[ ]?:([ ]+|$)`),
            reference: new RegExp(`^((${simplename})_|\`(?![ ])(.+?)${nonWhitespaceEscapeBefore}\`_)$`), // ((?P<simple>%(simplename)s)_|`(?![ ])(?P<phrase>.+?)%(non_whitespace_escape_before)s`_)$'),
            substitution: new RegExp(`((?![ ])(.+?)${nonWhitespaceEscapeBefore}\\|)([ ]+|$)`),
        };

        this.explicit.constructs = [
            [this.footnote.bind(this), new RegExp(`\\.\\.[ ]+\\[([0-9]+|\\#|\\#${simplename}|\\*)\\]([ ]+|$)`)],
            [this.citation.bind(this),
           new RegExp(`\\.\\.[ ]+\\[(${simplename})\\]([ ]+|$)`)],
            [this.hyperlink_target.bind(this),
             new RegExp('\\.\\.[ ]+_(?![ ]|$)')],
            [this.substitution_def.bind(this),
             new RegExp('\\.\\.[ ]+\\|(?![ ]|$)')],
            [this.directive.bind(this),
             new RegExp(`\\.\\.[ ]+(${simplename})[ ]?::([ ]+|$)`)],
        ];
    }

    footnote(match) {
        const [src, srcline] = this.stateMachine.getSourceAndLine();
        /* eslint-disable-next-line no-unused-vars */
        const [indented, indent, offset, blankFinish] = this.stateMachine.getFirstKnownIndented(
            { indent: match.index + match[0].length },

        );
        const label = match[1];
        let name = fullyNormalizeName(label);
        const footnote = new nodes.footnote(indented.join('\n'));
        footnote.source = src;
        footnote.line = srcline;
        if (name[0] === '#') { // auto-numbered
            name = name.substring(1); // autonumber label
            footnote.attributes.auto = 1;
            if (name) {
                footnote.attributes.names.push(name);
            }
            this.document.noteAutofootnote(footnote);
        } else if (name === '*') { // auto-symbol
            name = '';
            footnote.attributes.auto = '*';
            this.document.noteSymbolFootnote(footnote);
        } else {
            // manually numbered
            footnote.add(new nodes.label('', label));
            footnote.attributes.names.push(name);
            this.document.noteFootnote(footnote);
        }
        if (name) {
            this.document.noteExplicitTarget(footnote, footnote);
        } else {
            this.document.setId(footnote, footnote);
        }

        /* istanbul ignore else */
        if (indented && indented.length) {
            this.nestedParse(indented, { inputOffset: offset, node: footnote });
        }
        return [[footnote], blankFinish];
    }

    citation(match) {
        const [src, srcline] = this.stateMachine.getSourceAndLine();
        /* eslint-disable-next-line no-unused-vars */
        const [indented, indent, offset, blankFinish] = this.stateMachine.getFirstKnownIndented({
            indent: match.index + match[0].length,
        });
        const label = match[1];
        const name = fullyNormalizeName(label);
        const citation = new nodes.citation(indented.join('\n'));

        citation.source = src;
        citation.line = srcline;
        citation.add(new nodes.label('', label));
        citation.attributes.names.push(name);
        this.document.noteCitation(citation);
        this.document.noteExplicitTarget(citation, citation);
        /* istanbul ignore else */
        if (indented && indented.length) {
            this.nestedParse(indented, { inputOffset: offset, node: citation });
        }
        return [[citation], blankFinish];
    }

    /* eslint-disable-next-line camelcase */
    hyperlink_target(match) {
        const pattern = this.explicit.patterns.target;
        const lineno = this.stateMachine.absLineNumber();
        /* eslint-disable-next-line no-unused-vars */
        const [block, indent, offset, blankFinish] = this.stateMachine.getFirstKnownIndented(
                  {
 indent: match.index + match[0].length,
                    untilBlank: true,
                    stripIndent: false,
                  },
);
        const blocktext = match.input.substring(0, match.index + match[0].length) + block.join('\n');
        const block2 = [];
        block.forEach(line => block2.push(escape2null(line)));
        let escaped = block2[0];
        let blockindex = 0;
        let targetmatch;
        /* eslint-disable-next-line no-constant-condition */
        while (true) {
            targetmatch = pattern.exec(escaped);
            if (targetmatch) {
                break;
            }
            blockindex += 1;
            if (blockindex === block2.length) {
                throw new MarkupError('malformed hyperlink target.');
            }
            escaped += block2[blockindex];
        }
        block2.splice(0, blockindex);
        block2[0] = (`${block2[0]} `).substring(targetmatch.index + targetmatch[0].length - escape.length + 1).trim();
        const target = this.make_target(block2, blocktext, lineno,
                                  targetmatch[3]);
        return [[target], blankFinish];
    }

    /* eslint-disable-next-line camelcase */
    make_target(block, blockText, lineno, target_name) {
        const [targetType, data] = this.parse_target(block, blockText, lineno);
//        console.log(`target type if ${targetType} and data is ${data}`);
        if (targetType === 'refname') {
            const target = new nodes.target(blockText, '', [], { refname: fullyNormalizeName(data) });
            target.indirectReferenceName = data;
            this.add_target(target_name, '', target, lineno);
            this.document.noteIndirectTarget(target);
            return target;
        } if (targetType === 'refuri') {
            const target = new nodes.target(blockText, '');
            this.add_target(target_name, data, target, lineno);
            return target;
        }
            return data;
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    parse_target(block, blockText, lineno) {
//        console.log(`parse_target(${block}, ${blockText}, ${lineno})`);
        /* """
        Determine the type of reference of a target.

        :Return: A 2-tuple, one of:

            - 'refname' and the indirect reference name
            - 'refuri' and the URI
            - 'malformed' and a system_message node
            """ */
        if (block.length && block[block.length - 1].trim().endsWith('_')) {
            const lines = [];
            block.forEach(line => lines.push(line.trim()));
            const reference = lines.join(' ');
            const refname = this.is_reference(reference);
            if (refname) {
                return ['refname', refname];
            }
        }
        const refParts = splitEscapedWhitespace(block.join(' '));
        const reference = refParts.map(part => unescape(part).split(/\s+/).join('')).join(' ');
        return ['refuri', reference];
    }

    /* eslint-disable-next-line camelcase */
    is_reference(reference) {
        const match = this.explicit.patterns.reference.exec(
            `^${nodes.whitespaceNormalizeName(reference)}`,
);
        if (!match) {
            return null;
        }
        return unescape(match[2] || match[3]);
    }

    /* eslint-disable-next-line camelcase */
    add_target(targetname, refuri, target, lineno) {
        target.line = lineno;
        if (targetname) {
            const name = fullyNormalizeName(unescape(targetname));
            target.attributes.names.push(name);
            if (refuri) {
                const uri = this.inliner.adjustUri(refuri);
                /* istanbul ignore else */
                if (uri) {
                    target.attributes.refuri = uri;
                } else {
                    throw new ApplicationError(`problem with URI: ${refuri}`);
                }
            }
            this.document.noteExplicitTarget(target, this.parent);
        } else {
            // # anonymous target
            // istanbul ignore else
            if (refuri) {
                target.attributes.refuri = refuri;
            }
            target.attributes.anonymous = 1;
            this.document.noteAnonymousTarget(target);
        }
    }

    /* eslint-disable-next-line camelcase */
    substitution_def(match) {
        const pattern = this.explicit.patterns.substitution;
        /* eslint-disable-next-line no-unused-vars */
        const [src, srcline] = this.stateMachine.getSourceAndLine();
        const matchEnd = match.index + match[0].length;
        let myBlankFinish;
        /* eslint-disable-next-line no-unused-vars */
        const [block, indent,
        /* eslint-disable-next-line no-unused-vars */
               offset, blankFinish] = this.stateMachine.getFirstKnownIndented(
                   { indent: matchEnd, stripIndent: false },
);

        myBlankFinish = blankFinish;
        let myOffset = offset;
        // unuseD? fixme
        const blockText = (match.input.substring(0, matchEnd) + block.join('\n'));
        block.disconnect();
        let escaped = escape2null(block[0].trimEnd());
        let blockIndex = 0;
        let subDefMatch;
        let done = false;
        while (!done) {
            subDefMatch = pattern.exec(escaped);
            if (subDefMatch) {
                done = true;
            } else {
                blockIndex += 1;
                try {
                    escaped = `${escaped} ${escape2null(block[blockIndex].trim())}`;
                } catch (error) {
                    throw new MarkupError('malformed substitution definition.');
                }
            }
        }

        const subDefMatchEnd = subDefMatch.index + subDefMatch[0].length;
        block.splice(0, blockIndex);// strip out the substitution marker
        const tmpLine = `${block[0].trim()} `;
        block[0] = tmpLine.substring(subDefMatchEnd - escaped.length - 1, tmpLine.length - 1);
        if (!block[0]) {
            block.splice(0, 1);
            myOffset += 1;
        }
        while (block.length && !block[block.length - 1].trim()) {
            block.pop();
        }
        const subname = subDefMatch[2];
        const substitutionNode = new nodes.substitution_definition(blockText);
        substitutionNode.source = src;
        substitutionNode.line = srcline;
        if (!block.length) {
            const msg = this.reporter.warning(
                `Substitution definition "${subname}" missing contents.`,
                nodes.literal_block(blockText, blockText),
                { source: src, line: srcline },
);
            return [[msg], myBlankFinish];
        }
        block[0] = block[0].trim();
        substitutionNode.attributes.names.push(
            nodes.whitespaceNormalizeName(subname),
);
        /* eslint-disable-next-line no-unused-vars */
        const [newAbsOffset, blankFinish2] = this.nestedListParse(
            block, {
 inputOffset: myOffset,
node: substitutionNode,
                     initialState: 'SubstitutionDef',
                blankFinish: myBlankFinish,
},
);
        myBlankFinish = blankFinish2;
        let i = 0;
        substitutionNode.children.slice().forEach((node) => {
            // this is a mixin check!!
            if (!(node.isInline()
                 || node instanceof nodes.Text)) {
                this.parent.add(substitutionNode.children[i]);
                substitutionNode.children.splice(i, 1);
            } else {
                i += 1;
            }
        });
        const result = substitutionNode.traverse(nodes.Element).map((node) => {
            if (this.disallowedInsideSubstitutionDefinitions(node)) {
                const pformat = new nodes.literal_block('', node.pformat().trimEnd());
                const msg = this.reporter.error(
                    `Substitution definition contains illegal element <${node.tagname}>:`,
                    [pformat, new nodes.literal_block(blockText, blockText)],
                    { source: src, line: srcline },
);
                return [[msg], blankFinish];
            }
            return undefined;
        }).filter(x => x);
        if (result.length) {
            return result[0];
        }
        if (substitutionNode.children.length === 0) {
            const msg = this.reporter.warning(
                `Substitution definition "${subname}" empty or invalid.`,
                [new nodes.literal_block(blockText, blockText)],
                { source: src, line: srcline },
);
            return [[msg], blankFinish];
        }
        this.document.noteSubstitutionDef(
            substitutionNode, subname, this.parent,
);
        return [[substitutionNode], blankFinish];
    }

    disallowedInsideSubstitutionDefinitions(node) {
        if ((node.attributes.ids.length || node instanceof nodes.reference
             || node instanceof nodes.footnote_reference) && node.attributes.auto) {
            return true;
        }
        return false;
    }

    directive(match, optionPresets) {
        // """Returns a 2-tuple: list of nodes, and a "blank finish" boolean."""
        const typeName = match[1];
        if (typeof typeName === 'undefined') {
            throw new Error('need typename');
        }

        const [directiveClass, messages] = directives.directive(
            typeName, this.memo.language, this.document,
);
        this.parent.add(messages);
        if (directiveClass) {
            return this.run_directive(
                directiveClass, match, typeName, optionPresets,
);
        }
            return this.unknown_directive(typeName);
    }

    /* eslint-disable-next-line camelcase */
    run_directive(directive, match, typeName, option_presets) {
/*        """
        Parse a directive then run its directive function.

        Parameters:

        - `directive`: The class implementing the directive.  Must be
          a subclass of `rst.Directive`.

        - `match`: A regular expression match object which matched the first
          line of the directive.

        - `typeName`: The directive name, as used in the source text.

        - `option_presets`: A dictionary of preset options, defaults for the
          directive options.  Currently, only an "alt" option is passed by
          substitution definitions (value: the substitution name), which may
          be used by an embedded image directive.

        Returns a 2-tuple: list of nodes, and a "blank finish" boolean.
        """ */

/*        if isinstance(directive, (FunctionType, MethodType)):
            from docutils.parsers.rst import convert_directive_function
            directive = convert_directive_function(directive)
*/
        const lineno = this.stateMachine.absLineNumber();
        const initialLineOffset = this.stateMachine.lineOffset;
        /* eslint-disable-next-line no-unused-vars */
        const [indented, indent, lineOffset, blankFinish] = this.stateMachine.getFirstKnownIndented(
            {
 indent: match.index + match[0].length,
              stripTop: 0,
},
);
        const blockText = this.stateMachine.inputLines.slice(
            initialLineOffset, this.stateMachine.lineOffset + 1,
        );
        let args; let options; let content; let
contentOffset;
        try {
            [args, options, content, contentOffset] = this.parse_directive_block(
                indented,
                lineOffset,
                directive,
                option_presets,
            );
        } catch (error) {
            if (error instanceof MarkupError) {
                const err = this.reporter.error(`Error in "${typeName}" directive:\n${error.args.join(' ')}`,
                                                [new nodes.literal_block(blockText, blockText)],
                                                { line: lineno });
                return [[err], blankFinish];
            }
        }
        const directiveInstance = new directive(
            typeName, args, options, content, lineno,
            contentOffset, blockText, this, this.stateMachine,
);
        let result;
        try {
            result = directiveInstance.run();
        } catch (error) {
            const msgNode = this.reporter.system_message(
                error.level, error.msg, [], { line: lineno },
);
            msgNode.add(new nodes.literal_block(blockText, blockText));
            result = [msgNode];
        }
/*        assert isinstance(result, list), \
               'Directive "%s" must return a list of nodes.' % typeName
        for i in range(len(result)):
            assert isinstance(result[i], nodes.Node), \
                   ('Directive "%s" returned non-Node object (index %s): %r'
                    % (typeName, i, result[i]))
*/
        return [result,
                blankFinish || this.stateMachine.isNextLineBlank()];
    }

    /* eslint-disable-next-line camelcase */
    unknown_directive(typeName) {
        const lineno = this.stateMachine.absLineNumber();
        const [indented,
                indent,
                offset,
               blankFinish] = this.stateMachine
              .getFirstKnownIndented({ indent: 0, stripIndent: false });
        const text = indented.join('\n');
        const error = this.reporter.error(
            `Unknown directive type "${typeName}".`,
            [new nodes.literal_block(text, text)], { line: lineno },
);
        return [[error], blankFinish];
    }

    comment(match) {
        const matchEnd = match.result.index + match.result[0].length;
        if (!match.result.input.substring(matchEnd).trim()
           && this.stateMachine.isNextLineBlank()) { // # an empty comment?
            return [[new nodes.comment()], 1]; // "A tiny but practical wart."
        }
        const [indented,
            /* eslint-disable-next-line no-unused-vars */
               indent, offset,
               blankFinish] = this.stateMachine.getFirstKnownIndented(
                   { indent: matchEnd },
);
        while (indented && indented.length && !indented[indented.length - 1].trim()) {
            indented.trimEnd();
        }
        const text = indented.join('\n');
        return [[new nodes.comment(text, text)], blankFinish];
    }

    /* eslint-disable-next-line camelcase */
    explicit_markup(match, context, nextState) {
        /* """Footnotes, hyperlink targets, directives, comments.""" */
        const r = this.explicit_construct(match);
        /* istanbul ignore if */
        if (!isIterable(r)) {
            throw new Error('');
        }
        const [nodelist, blankFinish] = r;
        this.parent.add(nodelist);
        this.explicit_list(blankFinish);
        return [[], nextState, []];
    }

    /* eslint-disable-next-line camelcase */
    explicit_construct(match) {
        // """Determine which explicit construct this is, parse & return it."""
        const errors = [];
        const r = this.explicit.constructs.map(
            ([method, pattern]) => [method, pattern, pattern.exec(match.result.input)],
);
        const r2 = r
              .find(x => x[2] && x[0]);
        if (r2) {
            const [method, pattern, expmatch] = r2;
            try {
                return method(expmatch);
            } catch (error) {
                if (error instanceof MarkupError) {
                    const lineno = this.stateMachine.absLineNumber();
                    const message = error.args ? error.args.join(' ') : '';
                    errors.push(this.reporter.warning(message, [], { line: lineno }));
                } else {
                    throw error;
                }
            }
        }

        const [nodelist, blankFinish] = this.comment(match);
        return [[...nodelist], [...errors], blankFinish];
    }

    /* eslint-disable-next-line camelcase */
    explicit_list(blankFinish) {
        /* """
        Create a nested state machine for a series of explicit markup
        constructs (including anonymous hyperlink targets).
        """ */
        const offset = this.stateMachine.lineOffset + 1; // next line
        const [newlineOffset, blankFinish1] = this.nestedListParse(
            this.stateMachine.inputLines.slice(offset),
            {
 inputOffset: this.stateMachine.absLineOffset() + 1,
              node: this.parent,
initialState: 'Explicit',
              blankFinish,
              matchTitles: this.stateMachine.matchTitles,
},
);
        this.gotoLine(newlineOffset);
        if (!blankFinish1) {
            this.parent.add(this.unindentWarning('Explicit markup'));
        }
    }

    anonymous(match, context, nextState) {
        /* """Anonymous hyperlink targets.""" */
        const [nodelist, blankFinish] = this.anonymous_target(match);
        this.parent.add(nodelist);
        this.explicit_list(blankFinish);
        return [[], nextState, []];
    }

    /* eslint-disable-next-line camelcase */
    anonymous_target(match) {
        const lineno = this.stateMachine.absLineNumber();
        /* eslint-disable-next-line no-unused-vars */
        const [block, indent, offset, blankFinish] = this.stateMachine.getFirstKnownIndented({
 indent: match.result.index + match.result[0].length,
                                                          untilBlank: true,
});
        const blocktext = match.result.input.substring(0, match.result.index + match.result[0].length) + block.join('\n');
        const blockLines = [];
        block.forEach(line => blockLines.push(escape2null(line)));
        const block2 = new StringList(blockLines);

        const target = this.make_target(block2, blocktext, lineno, '');
        return [[target], blankFinish];
    }

    indent(match, context, nextState) {
        /* eslint-disable-next-line no-unused-vars */
        const [indented, indent, lineOffset, blankFinish] = this.stateMachine.getIndented({});
        /* istanbul ignore if */
        if (indented === undefined) {
            throw new Error();
        }
        const elements = this.block_quote(indented, lineOffset);
        this.parent.add(elements);
        if (!blankFinish) {
            this.parent.add(this.unindentWarning('Block quote'));
        }
        return [context, nextState, []];
    }

    /* eslint-disable-next-line camelcase */
    block_quote(indented, lineOffset) {
        /* istanbul ignore if */
        if (!indented) {
            throw new Error();
        }
        const elements = [];
        while (indented && indented.length) {
            const [blockquoteLines,
             attributionLines,
             attributionOffset,
             outIndented,
             newLineOffset] = this.split_attribution(indented, lineOffset);
            const blockquote = new nodes.block_quote();
            indented = outIndented;
            this.nestedParse(blockquoteLines, { inputOffset: lineOffset, node: blockquote });
            elements.push(blockquote);
            if (attributionLines) { // fixme
                const [attribution, messages] = this.parse_attribution(attributionLines,
                                             attributionOffset);
                blockquote.add(attribution);
                elements.push(...messages);
            }
            lineOffset = newLineOffset;
            while (indented && indented.length && !indented[0]) {
                indented = indented.slice(1);
                lineOffset += 1;
            }
        }
        return elements;
    }

    /* eslint-disable-next-line camelcase */
    split_attribution(indented, lineOffset) {
        this.attribution_pattern = new RegExp('(---?(?!-)|\\u2014) *(?=[^ \\n])');
        let blank;
        let nonblankSeen = false;
        for (let i = 0; i < indented.length; i += 1) {
            const line = indented[i].trimRight();
            if (line) {
                if (nonblankSeen && blank === i - 1) {
                    const match = this.attribution_pattern.exec(line);
                    if (match) {
                        const [attributionEnd, indent] = this.check_attribution(indented, i);
                        if (attributionEnd) {
                            const aLines = indented.slice(i, attributionEnd);
                            aLines.trimLeft(match.index + match[0].length, undefined, 1);
                            aLines.trimLeft(indent, 1);
                            return [indented.slice(0, i), aLines,
                                    i, indented.slice(attributionEnd),
                                    lineOffset + attributionEnd];
                        }
                    }
                }
                nonblankSeen = true;
            } else {
                blank = i;
            }
        }
        return [indented, null, null, null, null];
    }

    /* eslint-disable-next-line camelcase */
    check_attribution(indented, attributionStart) {
        let indent = null;
        let i;
        for (i = attributionStart + 1; i < indented.length; i += 1) {
            const line = indented[i].trimRight();
            if (!line) {
                break;
            }
            if (indent == null) {
                indent = line.length - line.trimLeft().length;
            } else if ((line.length - line.lstrip().length) !== indent) {
                return [null, null]; // bad shape; not an attribution
            }
        }
        if (i === indented.length) {
            i += 1;
        }
        return [i, indent || 0];
    }

    enumerator(match, context, nextState) {
        const [format, sequence, text, ordinal] = this.parseEnumerator(match);
        if (!this.isEnumeratedListItem(ordinal, sequence, format)) {
            throw TransitionCorrection('text');
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
        const [listitem, blankFinish1] = this.list_item(match.match.index + match.match[0].length);
        let blankFinish = blankFinish1;
        enumlist.add(listitem);
        const offset = this.stateMachine.lineOffset + 1; // next line
        const [newlineOffset, blankFinish2] = this.nestedListParse(
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
        blankFinish = blankFinish2;
        this.gotoLine(newlineOffset);
        if (!blankFinish) {
            this.parent.add(this.unindent_warning('Enumerated list'));
        }
        return [[], nextState, []];
    }

    /* eslint-disable-next-line camelcase */
    parse_attribution(indented, lineOffset) {
        const text = indented.join('\n').trimRight();
        const lineno = this.stateMachine.absLineNumber() + lineOffset;
        const [textnodes, messages] = this.inline_text(text, lineno);
        const anode = new nodes.attribution(text, '', textnodes);
        const [source, line] = this.stateMachine.getSourceAndLine(lineno);
        anode.source = source;
        anode.line = line;
        return [anode, messages];
    }

    bullet(match, context, nextState) {
//      console.log(`in bullet`);
        const bulletlist = new nodes.bullet_list();
        [bulletlist.source,
         bulletlist.line] = this.stateMachine.getSourceAndLine();
//      console.log(`${bulletlist.source} ${bulletlist.line}`);
        /* istanbul ignore if */
        if (!this.parent) {
            throw new Error('no parent');
        }

        this.parent.add(bulletlist);
        bulletlist.attributes.bullet = match.result[0].substring(0, 1);

        const [i, blankFinish1] = this.list_item(
            match.pattern.lastIndex + match.result[0].length,
); /* -1 ? */
        let blankFinish = blankFinish1;
        /* istanbul ignore if */
        if (!i) {
            throw new Error('no node');
        }

        bulletlist.append(i);
        const offset = this.stateMachine.lineOffset + 1;
        const [newLineOffset, blankFinish2] = this.nestedListParse(
            this.stateMachine.inputLines.slice(offset), {
                inputOffset: this.stateMachine.absLineOffset() + 1,
                node: bulletlist,
                initialState: 'BulletList',
                blankFinish,
        },
);
        blankFinish = blankFinish2;
        this.gotoLine(newLineOffset);
        if (!blankFinish) {
            this.parent.add(this.unindentWarning('Bullet list'));
        }
        return [[], nextState, []];
    }

    /* eslint-disable-next-line camelcase */
    list_item(indent) {
//      console.log(`in list_item (indent=${indent})`);
        /* istanbul ignore if */
        if (indent == null) {
            throw new Error('Need indent');
        }

        let indented; let lineOffset; let blankFinish;
        /* eslint-disable-next-line no-unused-vars */
        let outIndent;
        if (this.stateMachine.line.length > indent) {
//          console.log(`get known indentd`);
            [indented, lineOffset, blankFinish] = this.stateMachine.getKnownIndented({ indent });
        } else {
            [indented, outIndent, lineOffset, blankFinish] = (
                this.stateMachine.getFirstKnownIndented({ indent }));
        }
        const listitem = new nodes.list_item(indented.join('\n'));
        if (indented) {
//          console.log('xnested parse');
            this.nestedParse(indented, {
 inputOffset: lineOffset,
                                         node: listitem,
});
        }
        return [listitem, blankFinish];
    }

/*
    enumerator(match, context, nextState) {
        // """Enumerated List Item"""
        const [format, sequence, text, ordinal] = this.parse_enumerator(match);
        if (!this.is_enumerated_list_item(ordinal, sequence, format)) {
            throw new TransitionCorrection('text');
        }
        const enumlist = new nodes.enumerated_list();
        this.parent.add(enumlist);
        if (sequence === '#') {
            enumlist.attributes.enumtype = 'arabic';
        } else {
            enumlist.attributes.enumtype = sequence;
        }
        enumlist.attributes.prefix = this.enum.formatinfo[format].prefix; // fixme check
        enumlist.attributes.suffix = this.enum.formatinfo[format].suffix;
        if (ordinal !== 1) {
            enumlist.attributes.start = ordinal;
            const msg = this.reporter.info(
                `Enumerated list start value not ordinal-1: "${text}" (ordinal ${ordinal})`, [], {},
);
            this.parent.add(msg);
        }
        let listitem;
        let blankFinish;
        [listitem, blankFinish] = this.list_item(match.result.index + match.result[0].length);
        enumlist.add(listitem);
        const offset = this.stateMachine.lineOffset + 1; // next line
    let newlineOffset;
    const [newlineOffset, blankFinish1] = this.nestedListParse(
            this.stateMachine.inputLines.slice(offset), {
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
*/
    // fixme
    /* eslint-disable-next-line camelcase,no-unused-vars */
    parse_enumerator(match, expectedSequence) {
        throw new Unimp('parse_enumerator');
    }

    /* eslint-disable-next-line camelcase */
    field_marker(match, context, nextState) {
        const fieldList = new nodes.field_list();
        this.parent.add(fieldList);
        const [field, blankFinish1] = this.field(match);
        let blankFinish = blankFinish1;
        fieldList.add(field);
        const offset = this.stateMachine.lineOffset + 1;
        const [newlineOffset, blankFinish2] = this.nestedListParse(
            this.stateMachine.inputLines.slice(offset),
            {
                inputOffset: this.stateMachine.absLineOffset() + 1,
                node: fieldList,
                initialState: 'FieldList',
                blankFinish,
            },
);
        blankFinish = blankFinish2;
        this.gotoLine(newlineOffset);
        if (!blankFinish) {
            this.parent.add(this.unindentWarning('Field list'));
        }
        return [[], nextState, []];
    }

    field(match) {
        const name = this.parse_field_marker(match);
        const [src, srcline] = this.stateMachine.getSourceAndLine();
        const lineno = this.stateMachine.absLineNumber();
        /* eslint-disable-next-line no-unused-vars */
        const [indented, indent, lineOffset, blankFinish] = this.stateMachine.getFirstKnownIndented(
                  { indent: match.result.index + match.result[0].length },
);
        const fieldNode = new nodes.field();
        fieldNode.source = src;
        fieldNode.line = srcline;
        const [nameNodes, nameMessages] = this.inline_text(name, lineno);
        fieldNode.add(new nodes.field_name(name, '', nameNodes, {}));
        const fieldBody = new nodes.field_body(
            indented.join('\n'), nameMessages, {},
);
        fieldNode.add(fieldBody);
        if (indented && indented.length) {
            this.parse_field_body(indented, lineOffset, fieldBody);
        }
        return [fieldNode, blankFinish];
    }

    /* eslint-disable-next-line camelcase */
    parse_field_marker(match) {
        /* """Extract & return field name from a field marker match.""" */
//        console.log(match);
        let field = match.result[0].substring(1);
        field = field.substring(0, field.lastIndexOf(':'));
        return field;
    }

    /* eslint-disable-next-line camelcase */
    parse_field_body(indented, offset, node) {
        this.nestedParse(indented, { inputOffset: offset, node });
    }

    /* eslint-disable-next-line camelcase */
    option_marker(match, context, nextState) {
        // """Option list item."""
        const optionlist = new nodes.option_list();
        /* eslint-disable-next-line no-unused-vars */// fixme
        const [source, line] = this.stateMachine.getSourceAndLine();
        let listitem;
        let blankFinish;
        try {
             [listitem, blankFinish] = this.option_list_item(match);
        } catch (error) {
            if (error instanceof MarkupError) {
                // This shouldn't happen; pattern won't match.
                const msg = this.reporter.error(`Invalid option list marker: ${error}`);
                this.parent.add(msg);
                const [indented,
                       /* eslint-disable-next-line no-unused-vars */
                       indent,
                       lineOffset, blankFinish2] = this.stateMachine.getFirstKnownIndented(
                          { indent: match.result.index + match.result[0].length },
);
                blankFinish = blankFinish2;
                const elements = this.block_quote(indented, lineOffset);
                this.parent.add(elements);
                if (!blankFinish) {
                    this.parent.add(this.unindentWarning('Option list'));
                }
                return [[], nextState, []];
            }
            throw error;
        }
        this.parent.add(optionlist);
        optionlist.add(listitem);
        const offset = this.stateMachine.lineOffset + 1; // next line
        const [newlineOffset, blankFinish3] = this.nestedListParse(
            this.stateMachine.inputLines.slice(offset),
            {
                inputOffset: this.stateMachine.absLineOffset() + 1,
                node: optionlist,
                initialState: 'OptionList',
                blankFinish,
            },
        );
        blankFinish = blankFinish3;
        this.gotoLine(newlineOffset);
        if (!blankFinish) {
            this.parent.add(this.unindentWarning('Option list'));
        }
        return [[], nextState, []];
    }

    /* eslint-disable-next-line camelcase */
    option_list_item(match) {
        const offset = this.stateMachine.absLineOffset();
        const options = this.parse_option_marker(match);
        const [indented,
               /* eslint-disable-next-line no-unused-vars */
               indent,
               lineOffset,
               blankFinish] = this.stateMachine.getFirstKnownIndented(
                   { indent: match.result.index + match.result[0].length },
);
        if (!indented || !indented.length) { //  not an option list item
            this.gotoLine(offset);
            throw new TransitionCorrection('text');
        }
        const optionGroup = new nodes.option_group('', options);
        const description = new nodes.description(indented.join('\n'));
        const optionListItem = new nodes.option_list_item('', [optionGroup,
                                                                 description]);
        if (indented && indented.length) {
            this.nestedParse(indented, {
 inputOffset: lineOffset,
                                         node: description,
});
        }
        return [optionListItem, blankFinish];
    }

    /* eslint-disable-next-line camelcase */
    parse_option_marker(match) {
    /* """
        Return a list of `node.option` and `node.option_argument` objects,
        parsed from an option marker match.

        :Exception: `MarkupError` for invalid option markers.
        """ */
        const optlist = [];
        const optionstrings = match.result[0].trimEnd().split(', ');
        optionstrings.forEach((optionstring) => {
            const tokens = optionstring.split(/s+/);
            let delimiter = ' ';
            const firstopt = tokens[0].split('=', 2);
            if (firstopt.length > 1) {
                // "--opt=value" form
                tokens.splice(0, 1, ...firstopt); // fixme check
                delimiter = '=';
            } else if (tokens[0].length > 2
                      && ((tokens[0].indexOf('-') === 0
                           && tokens[0].indexOf('--') !== 0)
                          || tokens[0].indexOf('+') === 0)) {
                // "-ovalue" form
                tokens.splice(0, 1, tokens[0].substring(0, 2), tokens[0].substring(2));
                delimiter = '';
            }
            if ((tokens.length > 1) && (tokens[1].startsWith('<')
                                     && tokens[-1].endsWith('>'))) {
                // "-o <value1 value2>" form; join all values into one token
                tokens.splice(1, tokens.length, tokens.slice(1).join(''));
            }
            if ((tokens.length > 0) && (tokens.length <= 2)) {
                const option = new nodes.option(optionstring);
                option.add(new nodes.option_string(tokens[0], tokens[0]));
                if (tokens.length > 1) {
                    option.add(new nodes.option_argument(tokens[1], tokens[1],
                                                         [], { delimiter }));
                }
                optlist.push(option);
            } else {
                throw new MarkupError(`wrong number of option tokens (=${tokens.length}), should be 1 or 2: "${optionstring}"`);
            }
        });
        return optlist;
    }

    doctest(match, context, nextState) {
        const data = this.stateMachine.getTextBlock().join('\n');
        // TODO: prepend class value ['pycon'] (Python Console)
        // parse with `directives.body.CodeBlock` (returns literal-block
        // with class "code" and syntax highlight markup).
        this.parent.add(new nodes.doctest_block(data, data));
        return [[], nextState, []];
    }

    /* eslint-disable-next-line camelcase */
    line_block(match, context, nextState) {
        // """First line of a line block."""
        const block = new nodes.line_block();
        this.parent.add(block);
        const lineno = this.stateMachine.absLineNumber();
        const [line, messages, blankFinish1] = this.line_block_line(match, lineno);
        let blankFinish = blankFinish1;
        block.add(line);
        this.parent.add(messages);
        if (!blankFinish) {
            const offset = this.stateMachine.lineOffset + 1; // next line
            const [newLineOffset, blankFinish2] = this.nestedListParse(
                this.stateMachine.inputLines.slice(offset),
                {
 inputOffset: this.stateMachine.absLineOffset() + 1,
                  node: block,
initialState: 'LineBlock',
                  blankFinish: 0,
},
            );
            blankFinish = blankFinish2;
            this.gotoLine(newLineOffset);
        }
        if (!blankFinish) {
            this.parent.add(this.reporter.warning(
                'Line block ends without a blank line.', [],
                { line: lineno + 1 },
));
        }
        if (block.children.length) {
            if (block.children[0].indent == null) {
                block.children[0].indent = 0;
            }
            this.nest_line_block_lines(block);
        }
        return [[], nextState, []];
    }

    /* eslint-disable-next-line camelcase */
    line_block_line(match, lineno) {
        // """Return one line element of a line_block."""
        /* eslint-disable-next-line no-unused-vars */
        const [indented, indent, lineOffset, blankFinish] = this
              .stateMachine.getFirstKnownIndented(
            {
 indent: match.result.index + match.result[0].length,
              untilBlank: true,
},
);
        const text = indented.join('\n');
        const [textNodes, messages] = this.inline_text(text, lineno);
        const line = new nodes.line(text, '', textNodes);
        if (match.result.input.trimEnd() !== '|') {
            line.indent = match.result[1].length - 1;
        }

        return [line, messages, blankFinish];
    }

    /* eslint-disable-next-line camelcase */
    nest_line_block_lines(block) {
        for (let i = 1; i < block.length; i += 1) {
            if (typeof block[i].indent === 'undefined') {
                block[i].indent = block[i - 1].indent;
            }
        }
        this.nest_line_block_segment(block);
    }

    /* eslint-disable-next-line camelcase */
    nest_line_block_segment(block) {
        const indents = [];
        let least;
        for (let i = 0; i < block.length; i += 1) {
            const indent = block[i].indent;
            if (typeof least === 'undefined' || indent < least) {
                least = indent;
            }
            indents.push(block[i].indent);
        }
        const newItems = [];
        let newBlock = new nodes.line_block();
        for (let i = 0; i < block.length; i += 1) {
            const item = block[i];
            if (item.indent > least) {
                newBlock.add(item);
            } else {
                if (newBlock.children.length) {
                    this.nest_line_block_segment(newBlock);
                    newItems.push(newBlock);
                    newBlock = new nodes.line_block();
                }
                newItems.push(item);
            }
        }
        if (newBlock.length) {
            this.nest_line_block_segment(newBlock);
            newItems.push(newBlock);
        }
        // fixme does this detach?
        for (let i = 0; i < newItems.length; i += 1) {
            block[i] = newItems[i];
        }
        block.length = newItems.length;
    }

    /* eslint-disable-next-line camelcase */
    grid_table_top(match, context, nextState) {
        // """Top border of a full table."""
        return this.table_top(match, context, nextState,
                              this.isolate_grid_table.bind(this),
                              tableparser.GridTableParser);
    }

    /* eslint-disable-next-line camelcase */
    simple_table_top(match, context, nextState) {
        /* """Top border of a simple table.""" */
        return this.table_top(match, context, nextState,
                              this.isolate_simple_table.bind(this),
                              tableparser.SimpleTableParser);
    }

    /* eslint-disable-next-line camelcase */
    table_top(match, context, nextState, isolate_function, parser_class) {
        // """Top border of a generic table."""
        const [nodelist, blankFinish] = this.table(isolate_function, parser_class);
        this.parent.add(nodelist);
        if (!blankFinish) {
            const msg = this.reporter.warning(
                'Blank line required after table.', [],
                { line: this.stateMachine.absLineNumber() + 1 },
);
            this.parent.add(msg);
        }
        return [[], nextState, []];
    }

    table(isolateFunction, parserClass) {
        // """Parse a table."""
        const r = isolateFunction();
        if (!isIterable(r)) {
            throw new Error();
        }
        const [block, messages, blankFinish] = r;
        let nodelist;
        if (block && block.length) {
            try {
                const parser = new parserClass();
                const tabledata = parser.parse(block);
                const tableline = (this.stateMachine.absLineNumber() - block.length + 1);
                const table = this.build_table(tabledata, tableline);
                nodelist = [table, ...messages];
            } catch (error) {
                if (error instanceof tableparser.TableMarkupError) {
                    nodelist = [...this.malformed_table(block, error.args ? error.args.join(' ') : '',
                                                        error.offset), ...messages];
                } else {
                    throw error;
                }
            }
        } else {
            nodelist = messages;
        }
        return [nodelist, blankFinish];
    }

    /* eslint-disable-next-line camelcase */
    isolate_grid_table() {
        const messages = [];
        let block;
        let blankFinish = 1;
        try {
            block = this.stateMachine.getTextBlock(0, true);
        } catch (error) {
            if (error instanceof UnexpectedIndentationError) {
                const [block2, src, srcline] = error.args;
                block = block2;
                messages.add(this.reporter.error('Unexpected indentation.', [],
                                                 { source: src, line: srcline }));
                blankFinish = 0;
            }
        }

        if (!block) {
            throw new Error();
        }

        block.disconnect();
        // for East Asian chars:
        block.padDoubleWidth(this.doubleWidthPadChar);
        const width = block[0].trim().length;
        for (let i = 0; i < block.length; i += 1) {
            block[i] = block[i].trim();
            if (block[i][0] !== '+' && block[i][0] !== '|') { // check left edge
                blankFinish = 0;
                this.stateMachine.previousLine(block.length - i);
                block.splice(i, block.length - i);
                break;
            }
        }
        if (!this.gridTableTopPat.test(block[block.length - 1])) { // find bottom
            blankFinish = 0;
            // from second-last to third line of table:
            let myBreak = false;
            for (let i = block.length - 2; i >= 1; i -= 1) { // fixme test
                // for i in range(len(block) - 2, 1, -1):
                if (this.grid_table_top_pat.test(block[i])) {
                    this.stateMachine.previousLine(block.length - i + 1);
                    block.splice(i + 1, block.length - (i + 1));
                    myBreak = true;
                    break;
                }
            }
            if (!myBreak) {
                messages.push(...this.malformed_table(block));
                return [[], messages, blankFinish];
            }
        }

        for (let i = 0; i < block.length; i += 1) { // check right edge
            if (block[i].length !== width || !/[+|]/.test(block[i][block[i].length - 1])) {
                messages.push(...this.malformed_table(block));
                return [[], messages, blankFinish];
            }
        }
        return [block, messages, blankFinish];
    }

    /* eslint-disable-next-line camelcase */
    isolate_simple_table() {
        const start = this.stateMachine.lineOffset;
        const lines = this.stateMachine.inputLines;
        const limit = lines.length - 1;
        const toplen = lines[start].trim().length;
        const patternMatch = RegExps.simpleTableBorderPat.exec.bind(RegExps.simpleTableBorderPat);
        let found = 0;
        let foundAt;
        let i = start + 1;
        let myBreak = false;
        let end;
        while (i <= limit) {
            const line = lines[i];
            const match = patternMatch(line);
            if (match) {
                if (line.trim().length !== toplen) {
                    this.stateMachine.nextLine(i - start);
                    const messages = this.malformed_table(
                        lines.slice(start, i + 1),
                        'Bottom/header table border does not match top border.',
);
                    return [[], messages, i === limit || !lines[i + 1].trim()];
                }
                found += 1;
                foundAt = i;
                if (found === 2 || i === limit || !lines[i + 1].trim()) {
                    end = i;
                    myBreak = true;
                }
            }
            i += 1;
        }
        let block;
        if (!myBreak) {
            // reached end of input_lines
            let extra;
            if (found) {
                extra = ' or no blank line after table bottom';
                this.stateMachine.nextLine(foundAt - start);
                block = lines.slice(start, foundAt + 1);
            } else {
                extra = '';
                this.stateMachine.next_line(i - start - 1);
                block = lines.slice(start);
            }
            const messages = this.malformed_table(
                block, `No bottom table border found${extra}`,
);
            return [[], messages, !extra];
        }
        this.stateMachine.nextLine(end - start);
        block = lines.slice(start, end + 1);
        // for East Asian chars:
        block.padDoubleWidth(this.doubleWidthPadChar);
        return [block, [], end === limit || !lines[end + 1].trim()];
    }

    /* eslint-disable-next-line camelcase */
    malformed_table(block, detail = '', offset = 0) {
        throw new Error(detail);
        block.replace(this.doubleWidthPadChar, '');
        const data = block.join('\n');
        let message = 'Malformed table.';
        const startline = this.stateMachine.absLineNumber() - block.length + 1;
        if (detail) {
            message += `\n${detail}`;
        }
        const error = this.reporter.error(
            message,
            [new nodes.literal_block(data, data)],
            { line: startline + offset },
        );
        return [error];
    }

    /* eslint-disable-next-line camelcase */
    build_table(tabledata, tableline, stubColumns = 0, widths) {
        const [colwidths, headRows, bodyrows] = tabledata;
        const table = new nodes.table();
        if (widths === 'auto') {
            table.attributes.classes.push('colwidths-auto');
        } else if (widths) { // : # "grid" or list of integers
            table.attributes.classes.push(['colwidths-given']);
        }
        const tgroup = new nodes.tgroup('', [], { cols: colwidths.length });
        table.add(tgroup);
        colwidths.forEach((colwidth) => {
            const colspec = new nodes.colspec('', [], { colwidth });
            if (stubColumns) {
                colspec.attributes.stub = 1;
                stubColumns -= 1;
            }
            tgroup.add(colspec);
        });
        if (headRows) {
            const thead = new nodes.thead('', '', [], {});
            tgroup.add(thead);
            headRows.map(row => this.buildTableRow(row, tableline))
                .forEach(row => thead.add(row));
        }
        const tbody = new nodes.tbody();
        tgroup.add(tbody);
        bodyrows.map(row => this.buildTableRow(row, tableline)).forEach(row => tbody.add(row));
        return table;
    }

    buildTableRow(rowdata, tableline) {
        const row = new nodes.row('', [], {});
        rowdata.filter(x => x).forEach(([morerows, morecols, offset, cellblock]) => {
            const attributes = {};
            if (morerows) {
                attributes.morerows = morerows;
            }
            if (morecols) {
                attributes.morecols = morecols;
            }
            const entry = new nodes.entry('', [], attributes);
            row.add(entry);
            if (cellblock.join('')) {
                this.nestedParse(cellblock, {
 inputOffset: tableline + offset,
                                              node: entry,
});
            }
        });
        return row;
    }

    line(match, context, nextState) {
        if (this.stateMachine.matchTitles) {
            return [[match.input], 'Line', []];
        } if (match.match.input.trim() === '::') {
            throw new TransitionCorrection('text');
        } else if (match.match.input.trim().length < 4) {
            const msg = this.reporter.info(
                'Unexpected possible title overline or transition.\n'
                + "Treating it as ordinary text because it's so short.",
                { line: this.stateMachine.absLineNumber() },
);
            this.parent.add(msg);
            throw new TransitionCorrection('text');
        } else {
            const blocktext = this.stateMachine.line;
            const msg = this.reporter.severe(
                  'Unexpected section title or transition.',
                [nodes.literal_block(blocktext, blocktext)],
                { line: this.stateMachine.absLineNumber() },
);
            this.parent.add(msg);
            return [[], nextState, []];
        }
    }


        /* eslint-disable-next-line no-unused-vars */
    text(match, context, nextState) {
        /* istanbul ignore if */
        if (match.input === undefined) {
            throw new Error('');
        }

        return [[match.input], 'Text', []];
    }
}
Body.stateName = 'Body';
Body.constructor.stateName = 'Body';
export default Body;
