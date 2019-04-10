import * as statemachine from '../../StateMachine';
import * as languages from '../../languages';
import * as nodes from '../../nodes';
import * as tableparser from './tableparser.js';
import { matchChars } from '../../utils/punctuationChars';
import { escape2null, splitEscapedWhitespace } from '../../utils';
import RSTStateMachine from './RSTStateMachine';
import Inliner from './Inliner';

const nonWhitespaceBefore = '(?<!\\s)'
const nonWhitespaceEscapeBefore = '(?<![\\s\\x00])'
const nonUnescapedWhitespaceEscapeBefore = '(?<!(?<!\\x00)[\\s\\x00])'
const nonWhitespaceAfter = '(?!\\s)'

const StringList = statemachine.StringList;
//import * as roles from './Roles';

import { ApplicationError, DataError, EOFError, InvalidArgumentsError, UnimplementedError as Unimp } from '../../Exceptions';
import { punctuation_chars, column_width, unescape, isIterable } from '../../utils';

const nonalphanum7bit = '[!-/:-@[-\`{-~]';
const simplename = '\w+';

class MarkupError extends DataError { }

const normalize_name = nodes.fullyNormalizeName;

const { StateMachineWS } = statemachine;
const { StateWS } = statemachine;

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

class NestedStateMachine extends StateMachineWS {
    run({
 inputLines, inputOffset, memo, node, matchTitles,
    }) {
	/* istanbul ignore if */
        if (!inputLines) {
            throw new Error('need inputlines');
        }

	/* istanbul ignore if */
        if (matchTitles === undefined) {
            matchTitles = true;
        }
        this.matchTitles = matchTitles;
        this.memo = memo;
        this.document = memo.document;
	/* istanbul ignore if */
        if (!this.document) {
            throw new Error('need document');
        }

        this.attachObserver(this.document.noteSource.bind(this.document));
        this.reporter = memo.reporter;
        this.language = memo.language;
        this.node = node;
        const results = super.run({ inputLines, inputOffset });
	/* istanbul ignore if */
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

    /* istanbul ignore next */
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
	/* istanbul ignore if */
        if (!this.memo || !this.memo.document) {
            throw new Error('need memo');
        }
	/* istanbul ignore if */
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
	/* istanbul ignore if */
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
	/* istanbul ignore if */
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
        const data =  lines.join('\n').trimEnd();
        let text;
        let literalnext;
        if (/(?<!\\)(\\\\)*::$/.test(data)) {
            if (data.length === 2) {
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
        pats.longopt = `(--|/)${pats.optname}([ =]${pats.optarg})?`;
        pats.option = `(${pats.shortopt}|${pats.longopt})`;

        for (const format of enum_.formats) {
            pats[format] = `(${
                [enum_.formatinfo[format].prefix,
                 pats.enum,
                 enum_.formatinfo[format].suffix].join('')})`;
        }

        this.patterns = {
            bullet: '[-+*\\u2022\\u2023\\u2043]( +|$)',
            enumerator: `(${pats.parens}|${pats.rparen}|${pats.period})( +|$)`,
            'field_marker': ':(?![: ])([^:\\\\]|\\\\.|:(?!([ `]|$)))*(?<! ):( +|$)',
            grid_table_top: this.gridTableTopPat,
            'option_marker': `${pats.option}(, ${pats.option})*(  +| ?$)`,
            'doctest': '>>>( +|$)',
            'line_block': '\\|( +|$)',
            grid_table_Top: this.gridTableTopPat,
                simple_table_top: this.simpleTableTopPat,
            explicit_markup: '\\.\\.( +|$)',
            anonymous: '__( +|)',
            line: `(${pats.nonalphanum7bit})\\1* *$`,
            text: '',
        };
//      console.log(this.enumerator);

        this.initialTransitions = ['bullet', 'enumerator', 'field_marker', 'option_marker', 'doctest', 'line_block', 'grid_table_top', 'simple_table_top', 'explicit_markup', 'anonymous', 'line', 'text']

        this.explicit = {};
	this.explicit.patterns = {
	    target: new RegExp(`(_|(?!_)(\`?)(?![ \`])(.+?)${nonWhitespaceEscapeBefore})(?<!(?<!\\x00):)${nonWhitespaceEscapeBefore}[ ]?:([ ]+|$)`),
            reference: new RegExp('zzzz'),//((?P<simple>%(simplename)s)_|`(?![ ])(?P<phrase>.+?)%(non_whitespace_escape_before)s`_)$'),
            substitution: new RegExp('zzzz')//((?![ ])(?P<name>.+?)%(non_whitespace_escape_before)s\\|)([ ]+|$)'),
	};

        this.explicit.constructs = [
            [ this.footnote.bind(this), new RegExp(`\\.\\.[ ]+\\[([0-9]+|\\#|\\#${simplename}|\\*)\\]([ ]+|$)`) ],
            [this.citation.bind(this),
           new RegExp(`\\.\\.[ ]+\\[(${simplename})\\]([ ]+|$)`)],
            [this.hyperlink_target.bind(this),
             new RegExp('\\.\\.[ ]+(?![ ]|$)')],
            [this.substitution_def.bind(this),
             new RegExp('\\.\\.[ ]+\\|(?![ ]|$)')],
            [this.directive.bind(this),
             new RegExp(`\\.\\.[ ]+(${simplename})[ ]?::([ ]+|$)`)],
        ];
    }

    footnote(match) {
        /*src, srcline = self.state_machine.get_source_and_line()
          indented, indent, offset, blank_finish = \
          self.state_machine.get_first_known_indented(match.end())
          label = match.group(1)
          name = normalize_name(label)
          footnote = nodes.footnote('\n'.join(indented))
          footnote.source = src
          footnote.line = srcline
          if name[0] == '#':              # auto-numbered
          name = name[1:]             # autonumber label
          footnote['auto'] = 1
          if name:
          footnote['names'].append(name)
          self.document.note_autofootnote(footnote)
          elif name == '*':               # auto-symbol
          name = ''
          footnote['auto'] = '*'
          self.document.note_symbol_footnote(footnote)
          else:                           # manually numbered
          footnote += nodes.label('', label)
          footnote['names'].append(name)
          self.document.note_footnote(footnote)
          if name:
          self.document.note_explicit_target(footnote, footnote)
          else:
          self.document.set_id(footnote, footnote)
          if indented:
          self.nested_parse(indented, input_offset=offset, node=footnote)
          return [footnote], blank_finish
	*/
    }

    citation(match) {
	throw new Unimp("citation");
    }

    hyperlink_target(match) {
	throw new Unimp("hyperlink_target");
    }

    make_target(block, block_text, lineno, target_name) {
        const [ target_type, data ] = this.parse_target(block, block_text, lineno)
        if(target_type === 'refname') {
            const target = new nodes.target(block_text, '', [], { refname: normalize_name(data) });
            target.indirectReferenceName = data
            this.add_target(target_name, '', target, lineno)
            this.document.noteIndirectTarget(target)
            return target
	} else if(target_type === 'refuri') {
            const target = new nodes.target(block_text, '')
            this.add_target(target_name, data, target, lineno)
            return target
	} else {
            return data;
	}
    }

    parse_target(block, block_text, lineno) {
        /*"""
        Determine the type of reference of a target.

        :Return: A 2-tuple, one of:

            - 'refname' and the indirect reference name
            - 'refuri' and the URI
            - 'malformed' and a system_message node
            """*/
        if(block.length && block[block.length - 1].trim().endsWith('_')) {
	    const lines = [];
	    block.forEach(line => lines.push(line.trim()));
            const reference = lines.join(' ');
            const refname = this.is_reference(reference)
            if(refname) {
                return [ 'refname', refname ]
	    }
	}
        const ref_parts = splitEscapedWhitespace(block.join(' '));
        const reference = ref_parts.map(part => unescape(part).split(/\s+/).join('')).join(' ');
        return ['refuri', reference]
    }
    is_reference(reference) {
        const match = this.explicit.patterns.reference.exec(
            '^' + whitespaceNormalizeName(reference))
        if(!match) {
	    return null;
	}
	throw new Unimp();
       // return unescape(match.group('simple') or match.group('phrase'))
    }

    add_target(targetname, refuri, target, lineno) {
        target.line = lineno
        if(targetname) {
            const name = normalize_name(unescape(targetname))
            target.attributes['names'].append(name)
            if(refuri) {
                const uri = this.inliner.adjust_uri(refuri)
		/* istanbul ignore else */
                if(uri) {
                    target.attributes['refuri'] = uri
                } else {
                    throw new ApplicationError(`problem with URI: ${refuri}`);
		}
	    }
            this.document.noteExplicitTarget(target, this.parent)
	} else {
	    //# anonymous target
            if(refuri) {
                target.attributes['refuri'] = refuri
	    }
            target.attributes['anonymous'] = 1
            this.document.noteAnonymousTarget(target)
	}
    }

    substitution_def(match) {
	throw new Unimp("substitution_def");
    }

    directive(match, option_presets) {
        //"""Returns a 2-tuple: list of nodes, and a "blank finish" boolean."""
        const type_name = match.result[1]
        const [ directive_class, messages ] = new directives.directive(
            type_name, this.memo.language, this.document)
        this.parent.add(messages)
        if(directive_class) {
            return this.run_directive(
                directive_class, match, type_name, option_presets)
        } else {
            return this.unknown_directive(type_name)
	}
    }

    run_directive(directive, match, type_name, option_presets) {
/*        """
        Parse a directive then run its directive function.

        Parameters:

        - `directive`: The class implementing the directive.  Must be
          a subclass of `rst.Directive`.

        - `match`: A regular expression match object which matched the first
          line of the directive.

        - `type_name`: The directive name, as used in the source text.

        - `option_presets`: A dictionary of preset options, defaults for the
          directive options.  Currently, only an "alt" option is passed by
          substitution definitions (value: the substitution name), which may
          be used by an embedded image directive.

        Returns a 2-tuple: list of nodes, and a "blank finish" boolean.
        """*/

	/*
        if isinstance(directive, (FunctionType, MethodType)):
            from docutils.parsers.rst import convert_directive_function
            directive = convert_directive_function(directive)
        lineno = self.state_machine.abs_line_number()
        initial_line_offset = self.state_machine.line_offset
        indented, indent, line_offset, blank_finish \
                  = self.state_machine.get_first_known_indented(match.end(),
                                                                strip_top=0)
        block_text = '\n'.join(self.state_machine.input_lines[
            initial_line_offset : self.state_machine.line_offset + 1])
        try:
            arguments, options, content, content_offset = (
                self.parse_directive_block(indented, line_offset,
                                           directive, option_presets))
        except MarkupError, detail:
            error = self.reporter.error(
                'Error in "%s" directive:\n%s.' % (type_name,
                                                   ' '.join(detail.args)),
                nodes.literal_block(block_text, block_text), line=lineno)
            return [error], blank_finish
        directive_instance = directive(
            type_name, arguments, options, content, lineno,
            content_offset, block_text, self, self.state_machine)
        try:
            result = directive_instance.run()
        except docutils.parsers.rst.DirectiveError, error:
            msg_node = self.reporter.system_message(error.level, error.msg,
                                                    line=lineno)
            msg_node += nodes.literal_block(block_text, block_text)
            result = [msg_node]
        assert isinstance(result, list), \
               'Directive "%s" must return a list of nodes.' % type_name
        for i in range(len(result)):
            assert isinstance(result[i], nodes.Node), \
                   ('Directive "%s" returned non-Node object (index %s): %r'
                    % (type_name, i, result[i]))
        return (result,
                blank_finish or self.state_machine.is_next_line_blank())
	*/
	throw new Unimp("run_Directive");
    }

    comment(match) {
        /*if not match.string[match.end():].strip() \
              and self.state_machine.is_next_line_blank(): # an empty comment?
            return [nodes.comment()], 1 # "A tiny but practical wart."
        indented, indent, offset, blank_finish = \
              self.state_machine.get_first_known_indented(match.end())
        while indented and not indented[-1].strip():
            indented.trim_end()
        text = '\n'.join(indented)
        return [nodes.comment(text, text)], blank_finish*/
	return [[], true];
    }

    explicit_markup(match, context, next_state) {
        /*"""Footnotes, hyperlink targets, directives, comments."""*/
        const [ nodelist, blank_finish ] = this.explicit_construct(match)
        this.parent.add(nodelist);
        this.explicit_list(blank_finish)
        return [[], next_state, []];
    }

    explicit_construct( match) {
        //"""Determine which explicit construct this is, parse & return it."""
//        throw new Unimp("explciit_construct");
        const errors = []
        for(const [ method, pattern ] of this.explicit.constructs) {
//      this.explicit.constructs.forEach(([ method, pattern ]) =>{
            const expmatch = pattern.exec('^' + match.result.input)
            if(expmatch) {
                try {
                    return method(expmatch); /* can also use bind */
                } catch(error) {
                    if(error instanceof MarkupError) {
                        const lineno = this.stateMachine.absLineNumber()
                        const message = error.args.join(' ');
                        errors.push(this.reporter.warning(message, [], { line: lineno }));
                        break;
                    }
                }
            }
        }

        const [ nodelist, blank_finish ]  = this.comment(match)
        return [[...nodelist], [...errors], blank_finish ]
    }

    explicit_list(blank_finish) {
        /*"""
        Create a nested state machine for a series of explicit markup
        constructs (including anonymous hyperlink targets).
        """*/
        const offset = this.stateMachine.lineOffset + 1   // next line
            let newline_offset;
        [ newline_offset, blank_finish ] = this.nestedListParse(
            this.stateMachine.inputLines.slice(offset),
            { inputOffset: this.stateMachine.absLineOffset() + 1,
              node: this.parent, initialState: 'Explicit',
              blankFinish: blank_finish,
              matchTitles: this.stateMachine.matchTitles });
        this.gotoLine(newline_offset)
        if(!blank_finish) {
            this.parent.add(self.unindent_warning('Explicit markup'));
	}
    }

    anonymous( match, context, next_state) {
        /*"""Anonymous hyperlink targets."""*/
        const [ nodelist, blank_finish ] = this.anonymous_target(match)
        this.parent.add(nodelist)
        this.explicit_list(blank_finish)
        return [[], next_state, []]
    }

    anonymous_target(match) {
        const lineno = this.stateMachine.absLineNumber()
        const [ block, indent, offset, blank_finish ]
              = this.stateMachine.getFirstKnownIndented({ indent: match.result.index + match.result[0].length,
                                                          untilBlank: true});
        const blocktext = match.result.input.substring(0, match.result.index + match.result[0].length) + block.join('\n');
        const blockLines = [];
        block.forEach(line => blockLines.push(escape2null(line)));
        const block2 = new StringList(blockLines);

        const target = this.make_target(block2, blocktext, lineno, '')
        return [[target], blank_finish]
    }

    indent(match, context, nextState) {
        const [indented, indent, lineOffset, blankFinish] = this.stateMachine.getIndented({});
	/* istanbul ignore if */
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
	/* istanbul ignore if */
        if (!this.parent) {
            throw new Error('no parent');
        }

        this.parent.add(bulletlist);
        bulletlist.attributes.bullet = match.result[0].substring(0, 1);

        let [i, blankFinish] = this.list_item(match.pattern.lastIndex + match.result[0].length); /* -1 ? */
	/* istanbul ignore if */
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
	/* istanbul ignore if */
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
            const msg = this.reporter.info(
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
        throw new Unimp("parse_enumerator");
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
                tokens.splice(0, 1, ...firstopt); // fixme check
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

    line_block(match, context, next_state) {
        //"""First line of a line block."""
        const block = new nodes.line_block()
        this.parent.add(block)
        const lineno = this.stateMachine.absLineNumber();
        let line;
        let messages;
        [ line, messages, blank_finish ]  = this.line_block_line(match, lineno)
        block.add(line)
        this.parent.add(messages)
        if(!blank_finish) {
            const offset = this.stateMachine.line_offset + 1   // next line
            let new_line_offset;
            [ new_line_offset, blank_finish ] = self.nested_list_parse(
                this.stateMachine.inputLines.slice(offset),
                { inputOffset: this.stateMachine.abs_line_offset() + 1,
                  node: block, initialState: 'LineBlock',
                  blankFinish: 0 });
            this.gotoLine(new_line_offset)
        }
        if(!blank_finish) {
            this.parent.add(this.reporter.warning(
                'Line block ends without a blank line.', [],
                { line: lineno+1}))
        }
        if(block.children.length) {
            if(block[0].indent == null) {
                block[0].indent = 0
            }
            this.nest_line_block_lines(block)
        }
        return [[], next_state, []]
    }

    line_block_line(match, lineno) {
        //"""Return one line element of a line_block."""
        const [ indented, indent, line_offset, blank_finish ] =
              this.stateMachine.get_first_known_indented({ indent: match.result.index + match.result[0].length, untilBlank: true});
        const text = indented.join('\n');
        const [ text_nodes, messages ] = this.inline_text(text, lineno)
        const line = new nodes.line(text, '', text_nodes)
        if(match.result.input.trimEnd() !== '|') {
            line.indent = match.result[1].length - 1;
        }

        return [line, messages, blank_finish];
    }

    nest_line_block_lines(self, block) {
        /*
        for index in range(1, len(block)):
            if getattr(block[index], 'indent', None) is None:
                block[index].indent = block[index - 1].indent
        self.nest_line_block_segment(block)
        */
    }
/*
    def nest_line_block_segment(self, block):
        indents = [item.indent for item in block]
        least = min(indents)
        new_items = []
        new_block = nodes.line_block()
        for item in block:
            if item.indent > least:
                new_block.append(item)
            else:
                if len(new_block):
                    self.nest_line_block_segment(new_block)
                    new_items.append(new_block)
                    new_block = nodes.line_block()
                new_items.append(item)
        if len(new_block):
            self.nest_line_block_segment(new_block)
            new_items.append(new_block)
        block[:] = new_items
*/
    grid_table_top(match, context, next_state) {
        //"""Top border of a full table."""
        return this.table_top(match, context, next_state,
                              this.isolate_grid_table,
                              tableparser.GridTableParser)
    }

    simple_table_top(match, context, next_state) {
        /*"""Top border of a simple table."""*/
        return this.table_top(match, context, next_state,
                              this.isolate_simple_table,
                              tableparser.SimpleTableParser)
    }
/*
    def table_top(self, match, context, next_state,
                  isolate_function, parser_class):
        """Top border of a generic table."""
        nodelist, blank_finish = self.table(isolate_function, parser_class)
        self.parent += nodelist
        if not blank_finish:
            msg = self.reporter.warning(
                'Blank line required after table.',
                line=this.stateMachine.absLineNumber()+1)
            self.parent += msg
        return [], next_state, []

    def table(self, isolate_function, parser_class):
        """Parse a table."""
        block, messages, blank_finish = isolate_function()
        if block:
            try:
                parser = parser_class()
                tabledata = parser.parse(block)
                tableline = (this.stateMachine.absLineNumber() - len(block)
                             + 1)
                table = self.build_table(tabledata, tableline)
                nodelist = [table] + messages
            except tableparser.TableMarkupError, err:
                nodelist = self.malformed_table(block, ' '.join(err.args),
                                                offset=err.offset) + messages
        else:
            nodelist = messages
        return nodelist, blank_finish

    def isolate_grid_table(self):
        messages = []
        blank_finish = 1
        try:
            block = this.stateMachine.get_text_block(flush_left=True)
        except statemachine.UnexpectedIndentationError, err:
            block, src, srcline = err.args
            messages.append(self.reporter.error('Unexpected indentation.',
                                                source=src, line=srcline))
            blank_finish = 0
        block.disconnect()
        # for East Asian chars:
        block.pad_double_width(self.double_width_pad_char)
        width = len(block[0].strip())
        for i in range(len(block)):
            block[i] = block[i].strip()
            if block[i][0] not in '+|': # check left edge
                blank_finish = 0
                this.stateMachine.previous_line(len(block) - i)
                del block[i:]
                break
        if not self.grid_table_top_pat.match(block[-1]): # find bottom
            blank_finish = 0
            # from second-last to third line of table:
            for i in range(len(block) - 2, 1, -1):
                if self.grid_table_top_pat.match(block[i]):
                    this.stateMachine.previous_line(len(block) - i + 1)
                    del block[i+1:]
                    break
            else:
                messages.extend(self.malformed_table(block))
                return [], messages, blank_finish
        for i in range(len(block)):     # check right edge
            if len(block[i]) != width or block[i][-1] not in '+|':
                messages.extend(self.malformed_table(block))
                return [], messages, blank_finish
        return block, messages, blank_finish

    def isolate_simple_table(self):
        start = this.stateMachine.line_offset
        lines = this.stateMachine.input_lines
        limit = len(lines) - 1
        toplen = len(lines[start].strip())
        pattern_match = self.simple_table_border_pat.match
        found = 0
        found_at = None
        i = start + 1
        while i <= limit:
            line = lines[i]
            match = pattern_match(line)
            if match:
                if len(line.strip()) != toplen:
                    this.stateMachine.next_line(i - start)
                    messages = self.malformed_table(
                        lines[start:i+1], 'Bottom/header table border does '
                        'not match top border.')
                    return [], messages, i == limit or not lines[i+1].strip()
                found += 1
                found_at = i
                if found == 2 or i == limit or not lines[i+1].strip():
                    end = i
                    break
            i += 1
        else:                           # reached end of input_lines
            if found:
                extra = ' or no blank line after table bottom'
                this.stateMachine.next_line(found_at - start)
                block = lines[start:found_at+1]
            else:
                extra = ''
                this.stateMachine.next_line(i - start - 1)
                block = lines[start:]
            messages = self.malformed_table(
                block, 'No bottom table border found%s.' % extra)
            return [], messages, not extra
        this.stateMachine.next_line(end - start)
        block = lines[start:end+1]
        # for East Asian chars:
        block.pad_double_width(self.double_width_pad_char)
        return block, [], end == limit or not lines[end+1].strip()

    def malformed_table(self, block, detail='', offset=0):
        block.replace(self.double_width_pad_char, '')
        data = '\n'.join(block)
        message = 'Malformed table.'
        startline = this.stateMachine.absLineNumber() - len(block) + 1
        if detail:
            message += '\n' + detail
        error = self.reporter.error(message, nodes.literal_block(data, data),
                                    line=startline+offset)
        return [error]

    def build_table(self, tabledata, tableline, stub_columns=0, widths=None):
        colwidths, headrows, bodyrows = tabledata
        table = nodes.table()
        if widths == 'auto':
            table['classes'] += ['colwidths-auto']
        elif widths: # "grid" or list of integers
            table['classes'] += ['colwidths-given']
        tgroup = nodes.tgroup(cols=len(colwidths))
        table += tgroup
        for colwidth in colwidths:
            colspec = nodes.colspec(colwidth=colwidth)
            if stub_columns:
                colspec.attributes['stub'] = 1
                stub_columns -= 1
            tgroup += colspec
        if headrows:
            thead = nodes.thead()
            tgroup += thead
            for row in headrows:
                thead += self.build_table_row(row, tableline)
        tbody = nodes.tbody()
        tgroup += tbody
        for row in bodyrows:
            tbody += self.build_table_row(row, tableline)
        return table

    def build_table_row(self, rowdata, tableline):
        row = nodes.row()
        for cell in rowdata:
            if cell is None:
                continue
            morerows, morecols, offset, cellblock = cell
            attributes = {}
            if morerows:
                attributes['morerows'] = morerows
            if morecols:
                attributes['morecols'] = morecols
            entry = nodes.entry(**attributes)
            row += entry
            if ''.join(cellblock):
                self.nested_parse(cellblock, input_offset=tableline+offset,
                                  node=entry)
        return row

*/
    line(match, context, nextState) {
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
	/* istanbul ignore if */
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
	/* istanbul ignore if */
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
    }

    blank() {
        this.invalidInput()
    }
    underline() {
        this.invalidInput()
    }
    indent() {
        this.invalidInput()
    }
    text() {
    this.invalidInput();
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

    indent(...args) {
        return this.text(...args);
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
        let title = match.result.input
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
        title = title.trimEnd()
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
        this.eofcheck = 0;              // @@@ not sure this is correct
        this.section({ title: title.trimStart(), source, style, lineno: lineno + 1, messages});
        this.eofcheck = 1
        return [[], 'Body', []];

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
            match, this.parent.attributes['enumtype'])
        if (( format !== this.format
              || (sequence !== '#' && (sequence !== this.parent.attributes['enumtype']
                                       || this.auto// fxme
                                       || ordinal !== (this.lastordinal + 1)))
              || !this.is_enumerated_list_item(ordinal, sequence, format))) {
            //# different enumeration: new list
            this.invalid_input()
        }
        if(sequence === '#') {
            this.auto = 1
        }
        const [listitem, blank_finish ] = this.list_item(match.result.index + match.result[0].length)
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

class ExtensionOptions extends FieldList {
    /* Parse field_list fields for extension options. */
    /* No nested parsing is done (including inline markup parsing). */

    parse_field_body(indented, offset, node) {
        //"""Override `Body.parse_field_body` for simpler parsing."""
        const lines = []
        for(const line of [...indented, '']) {
            if(line.trim()) {
                lines.push(line)
            } else if(lines.length) {
                const text = lines.join('\n')
                node.add(new nodes.paragraph(text, text));
                lines.length = 0;
            }
        }
    }
}

class LineBlock extends SpecializedBody {
    /*"""Second and subsequent lines of a line_block."""*/

    blank() {
        this.invalid_input();
    }

    line_block(match, context, next_state) {
        //"""New line of line block."""
        const lineno = this.stateMachine.absLineNumber()
        const [ line, messages, blank_finish ] = this.line_block_line(match, lineno)
        this.parent.add(line)
        this.parent.parent.add(messages)
        this.blankFinish = blank_finish
        return [[], next_state, []]
    }
}

class Explicit extends SpecializedBody {
    /*
    """Second and subsequent explicit markup construct."""
    */
    explicit_markup(match, context, next_state) {
        //"""Footnotes, hyperlink targets, directives, comments."""
        const [ nodelist, blank_finish ] = this.explicit_construct(match)
        this.parent.add(nodelist);
        this.blankFinish = blank_finish
        return [[], next_state, []]
    }

    anonymous( match, context, next_state) {
        //"""Anonymous hyperlink targets."""
        const [ nodelist, blank_finish ] = this.anonymous_target(match)
        this.parent.add(nodelist);
        this.blankFinish = blank_finish
        return [ [], next_state, [] ];
    }

    blank() {
        this.invalid_input();
    }
}

class SubstitutionDef extends Body {
    /*"""
    Parser for the contents of a substitution_definition element.
    """*/
    _init() {
        super._init();
        this.patterns = {
            'embedded_directive': new RegExp('(' + simplename + ')::( +|$)'),
            'text': ''}
        this.initialTransitions = ['embedded_directive', 'text']
    }

    embedded_directive(match, context, next_state) {
        const [ nodelist, blank_finish ]  = this.directive(match,
                                                           { alt: this.parent.attributes['names'][0]});
        this.parent.add(nodelist)
        if(!this.stateMachine.atEof()) {
            this.blankFinish = blank_finish
        }
        throw new EOFError();
    }
    text(match, context, next_state) {
        if(!this.stateMachine.atEof()) {
            this.blankFinish = this.stateMachine.isNextLineBlank();
        }
        throw new EOFError();
    }
}

class QuotedLiteralBlock extends RSTState {
/*
    """
    Nested parse handler for quoted (unindented) literal blocks.

    Special-purpose.  Not for inclusion in `state_classes`.
    """
*/
    _init() {
        super._init();
        this.patterns = {'initial_quoted': '(' + nonalphanum7bit + ')',
                'text': ''}
        this.initialTransitions = ['initial_quoted', 'text']
        this.messages = []
        this.initial_lineno = null;
    }

    blank( match, context, next_state) {
        if(context.length) {
            throw new EOFError();
        } else {
            return [context, next_state, []]
        }
    }

    eof( context) {
        if(context.length) {
            const [ src, srcline ] = this.stateMachine.getSourceAndLine(
                this.initial_lineno)
            const text = context.join('\n');
            const literal_block = new nodes.literal_block(text, text)
            literal_block.source = src
            literal_block.line = srcline
            this.parent.add(literal_block);
        } else {
            this.parent.add(this.reporter.warning(
                'Literal block expected; none found.', [],
                { line: this.stateMachine.absLineNumber() }));
            //# src not available, because statemachine.input_lines is empty
            this.stateMachine.previousLine()
        }
        this.parent.add(this.messages)
        return []
    }

    indent(match, context, next_state) {
//        assert context, ('QuotedLiteralBlock.indent: context should not '
//                         'be empty!')
        this.messages.push(
            this.reporter.error('Unexpected indentation.', [],
                                { line: this.stateMachine.absLineNumber() }));
        this.stateMachine.previousLine()
        throw new EOFError();
    }

    initial_quoted(match, context, next_state) {
        //"""Match arbitrary quote character on the first line only."""
        this.removeTransition('initial_quoted')
        const quote = match.result.input[0]
        const pattern = new RegExp(escapeRegExp(quote));
        //# New transition matches consistent quotes only:
        this.addTransition('quoted',
                           [pattern, this.quoted.bind(this),
                            this.constructor.name]);
        this.initial_lineno = this.stateMachine.absLineNumber()
        return [[match.result.input], next_state, []]
    }

    quoted(match, context, next_state) {
        //"""Match consistent quotes on subsequent lines."""
        context.push(match.result.input)
        return [context, next_state, []]
    }

    text(match, context, next_state) {
        if(context.length) {
            this.messages.push(
                this.reporter.error('Inconsistent literal block quoting.',
                                    [], { line: this.stateMachine.absLineNumber() }));
            this.stateMachine.previousLine()
        }
        throw new EOFError();
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

export const stateClasses = [Body, BulletList, DefinitionList, EnumeratedList, FieldList, OptionList, LineBlock, ExtensionOptions, Explicit, Text, Definition, Line];
//SubstitutionDef];

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
