import StateWS from '../../../states/StateWS';
import NestedStateMachine from '../NestedStateMachine';
import * as nodes from '../../../nodes';
import { EOFError } from '../../../Exceptions';

class RSTState extends StateWS {
    _init(args = {}) {
        super._init(args);
        this.nestedSm = NestedStateMachine;
        this.nestedSmCache = [];
        this.stateClasses = args.stateClasses;

        this.nestedSmKwargs = {
//            stateClasses: this.stateClasses,
            stateFactory: this.stateMachine.stateFactory.withStateClasses(this.stateClasses),
            initialState: 'Body',
            debug: args && args.stateMachine ? args.stateMachine.debug : false,
            debugFn: args && args.stateMachine ? args.stateMachine.debugFn : console.log,
        };
//      console.log(this.nestedSmKwargs);
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

    bof() {
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
        if (useDefault === 2 && this.nestedSmCache.length > 0) {
            stateMachine = this.nestedSmCache.pop();
        }

        if (!stateMachine) {
            // check things ?
        /* istanbul ignore if */
//            if (!stateMachineKwargs.stateClasses) {
//                throw new InvalidArgumentsError('stateClasses');
//            }
//          if(!stateMachineKwargs.document) {
//              throw new Error("expectinf document")
            //          }
            const stateFactory = this.stateMachine.stateFactory;
            if(!stateMachineKwargs.stateFactory) {
                throw new Error("need statefactory");
            }
//            console.log(stateMachineKwargs);
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
        if (block.parent && (block.length - blockLength) !== 0) {
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
        /* istanbul ignore next */
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
            stateFactory: this.stateMachine.stateFactory,
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

    checkSubsection({ source, style, lineno }) {
        const { memo } = this;
        const title_styles = memo.titleStyles;
        const mylevel = memo.sectionLevel;
        let level = 0;
        level = title_styles.indexOf(style) + 1;
        if (level === 0) {
            if (title_styles.length === memo.sectionLevel) { // new subsection
                title_styles.push(style);
                return 1;
            }
                this.parent.add(this.title_inconsistent(source, lineno));
                return null;
        }
        if (level <= mylevel) { //            // sibling or supersection
            memo.sectionLevel = level; // bubble up to parent section
            if (style.length === 2) {
                memo.sectionBubbleUpKludge = true;
            }
            // back up 2 lines for underline title, 3 for overline title
            this.stateMachine.previousLine(style.length + 1);
            throw new EOFError(); // let parent section re-evaluate
        }

        if (level === mylevel + 1) { // immediate subsection
            return 1;
        }
            this.parent.add(this.title_inconsistent(source, lineno));
            return undefined;
    }

    title_inconsistent(sourcetext, lineno) {
        const error = this.reporter.severe(
            'Title level inconsistent:', [new nodes.literal_block('', sourcetext)], { line: lineno },
);
        return error;
    }


    newSubsection({ title, lineno, messages }) {
        const { memo } = this;
        const mylevel = memo.sectionLevel;
        memo.sectionLevel += 1;
        const section_node = new nodes.section();
        this.parent.add(section_node);
        const [textnodes, title_messages] = this.inline_text(title, lineno);
        const titlenode = new nodes.title(title, '', textnodes);
        const name = nodes.fullyNormalizeName(titlenode.astext());
        section_node.attributes.names.push(name);
        section_node.add(titlenode);
        section_node.add(messages);
        section_node.add(title_messages);
        this.document.noteImplicitTarget(section_node, section_node);
        const offset = this.stateMachine.lineOffset + 1;
        const absoffset = this.stateMachine.absLineOffset() + 1;
        const newabsoffset = this.nestedParse(
            this.stateMachine.inputLines.slice(offset), {
 inputOffset: absoffset,
                                                         node: section_node,
matchTitles: true,
},
);
        this.gotoLine(newabsoffset);
        if (memo.sectionLevel <= mylevel) {
            throw new EOFError();
        }

            memo.sectionLevel = mylevel;
    }

    unindentWarning(nodeName) {
        const lineno = this.stateMachine.absLineNumber() + 1;
        return this.reporter.warning(`${nodeName} ends without a blank line; unexpected unindent.`, { line: lineno });
    }

    paragraph(lines, lineno) {
        const data = lines.join('\n').trimEnd();
        let text;
        let literalnext;
//      console.log(data);
        if (/(?<!\\)(\\\\)*::$/.test(data)) {
            if (data.length === 2) {
                return [[], 1];
            }
            if (' \n'.indexOf(data[data.length - 3]) !== -1) {
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

export default RSTState;
