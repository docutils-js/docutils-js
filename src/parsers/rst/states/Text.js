import RSTState from './RSTState';
import { columnWidth, isIterable } from '../../../utils';
import * as nodes from '../../../nodes';
import * as RegExps from '../RegExps';
import TransitionCorrection from '../../../TransitionCorrection';
import UnexpectedIndentationError from '../../../UnexpectedIndentationError';
import { EOFError } from '../../../Exceptions';


class Text extends RSTState {
    _init(args) {
        super._init(args);
        this.patterns = {
 underline: '([!-/:-@[-`{-~])\\1* *$',
                         text: '',
};
        this.initialTransitions = [['underline', 'Body'], ['text', 'Body']];
    }

    /* eslint-disable-next-line no-unused-vars */
    blank(match, context, nextState) {
        const [paragraph, literalnext] = this.paragraph(
            context, this.stateMachine.absLineNumber() - 1,
);
        this.parent.add(paragraph);
        if (literalnext) {
            this.parent.add(this.literal_block());
        }

        return [[], 'Body', []];
    }

    eof(context) {
        if ((context != null && !isIterable(context)) || context.length > 0) {
            this.blank(null, context, null);
        }
        return [];
    }

    /* eslint-disable-next-line no-unused-vars */
    indent(match, context, nextState) {
        /* """Definition list item.""" */
        const definitionlist = new nodes.definition_list();
        const [definitionlistitem, blankFinish1] = this.definition_list_item(context);
        let blankFinish = blankFinish1;
        definitionlist.add(definitionlistitem);
        this.parent.add(definitionlist);
        const offset = this.stateMachine.lineOffset + 1;
        const [newlineOffset, blankFinish2] = this.nestedListParse(
            this.stateMachine.inputLines.slice(offset),
            {
 inputOffset: this.stateMachine.absLineOffset() + 1,
              node: definitionlist,
initialState: 'DefinitionList',
              blankFinish,
blankFinishState: 'Definition',
},
        );
        blankFinish = blankFinish2;
        this.gotoLine(newlineOffset);
        if (!blankFinish) {
            this.parent.add(this.unindentWarning('Definition list'));
        }
        return [[], 'Body', []];
    }

    underline(match, context, nextState) {
        /* istanbul ignore if */
        if (!Array.isArray(context)) {
            throw new Error('Context should be array');
        }
        const lineno = this.stateMachine.absLineNumber();
        const title = context[0].trimRight();
        const underline = match.result.input.trimRight();
        const source = `${title}\n${underline}`;
        const messages = [];
        if (columnWidth(title) > underline.length) {
            if (underline.length < 4) {
                if (this.stateMachine.matchTitles) {
                    const msg = this.reporter.info(
                        'Possible title underline, too short for the title.\n'
                        + "Treating it as ordinary text because it's so short.", [], { line: lineno },
);
                    this.parent.add(msg);
                    throw new TransitionCorrection('text');
                }
            } else {
                const blocktext = `${context[0]}\n${this.stateMachine.line}`;
                const msg = this.reporter.warning(
                    'Title underline too short.',
                    [new nodes.literal_block(blocktext, blocktext)], { line: lineno },
);
                messages.push(msg);
            }
        }
        if (!this.stateMachine.matchTitles) {
            const blocktext = `${context[0]}\n${this.stateMachine.line}`;
            // We need get_source_and_line() here to report correctly
            const [src, srcline] = this.stateMachine.getSourceAndLine();
            const msg = this.reporter.severe(
                'Unexpected section title.',
                [new nodes.literal_block(blocktext, blocktext)], { source: src, line: srcline },
);
            this.parent.add(messages);
            this.parent.add(msg);
            return [[], nextState, []];
        }
        const style = underline[0];
        context.length = 0;
        this.section({
 title, source, style, lineno: lineno - 1, messages,
});

        return [[], nextState, []];
    }

    text(match, context, nextState) {
        const startline = this.stateMachine.absLineNumber() - 1;
        let msg;
        let block;
        try {
            block = this.stateMachine.getTextBlock(undefined, true);
        } catch (error) {
            if (error instanceof UnexpectedIndentationError) {
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
        this.parent.add(pelems);
        // fixme this.parent.add(msg)
        if (literalnext) {
            try {
                this.stateMachine.nextLine();
            } catch (error) {
                if (error instanceof EOFError) {
                    /* do nothing */
                } else {
                    throw error;
                }
            }
            this.parent.add(this.literal_block());
        }
        return [[], nextState, []];
    }

    /* eslint-disable-next-line camelcase */
    literal_block(match, context, nextState) {
        // """Return a list of nodes."""
        const [indented, indent, offset, blankFinish] = this.stateMachine.getIndented({});
        while (indented && indented.length && !indented[indented.length - 1].trim()) {
            indented.trimEnd();
        }
        if (!indented || !indented.length) {
            return this.quoted_literal_block();
        }
        const data = indented.join('\n');
        const literalBlock = new nodes.literal_block(data, data);
            const [source, line] = this.stateMachine.getSourceAndLine(offset + 1);
        literalBlock.source = source;
        literalBlock.line = line;
        const nodelist = [literalBlock];
        if (!blankFinish) {
            nodelist.push(this.unindentWarning('Literal block'));
        }
        return nodelist;
    }

    /* eslint-disable-next-line camelcase,no-unused-vars */
    quoted_literal_block(match, context, nextState) {
        const absLineOffset = this.stateMachine.absLineOffset();
        const offset = this.stateMachine.lineOffset;
        const parentNode = new nodes.Element();
        const newAbsOffset = this.nestedParse(
            this.stateMachine.inputLines.slice(offset),
            {
 inputOffset: absLineOffset,
              node: parentNode,
              matchTitles: false,
                stateMachineKwargs: {
                    stateFactory: this.stateMachine.stateFactory.withStateClasses(['QuotedLiteralBlock']),
                    initialState: 'QuotedLiteralBlock',
},
},
);
        this.gotoLine(newAbsOffset);
        return parentNode.children;
    }

    /* eslint-disable-next-line camelcase */
    definition_list_item(termline) {
        const [indented, indent, lineOffset, blankFinish] = this.stateMachine.getIndented({});
        const itemnode = new nodes.definition_list_item(
            [...termline, ...indented].join('\b'),
);
        const lineno = this.stateMachine.absLineNumber() - 1;
        [itemnode.source,
         itemnode.line] = this.stateMachine.getSourceAndLine(lineno);
        const [termlist, messages] = this.term(termline, lineno);
        itemnode.add(termlist);
        const definition = new nodes.definition('', messages);
        itemnode.add(definition);
        if (termline[0].endsWith('::')) {
            definition.add(this.reporter.info(
                'Blank line missing before literal block (after the "::")? '
                    + 'Interpreted as a definition list item.', [],
                { line: lineno + 1 },
));
        }
        this.nestedParse(indented, { inputOffset: lineOffset, node: definition });
        return [itemnode, blankFinish];
    }

    term(lines, lineno) {
        const [textNodes, messages] = this.inline_text(lines[0], lineno);
        const termNode = new nodes.term(lines[0]);
   //     [termNode.source,
    //     termNode.line] = this.stateMachine.getSourceAndLine(lineno)
        const nodeList = [termNode];
        textNodes.forEach((node) => {
            if (node instanceof nodes.Text) {
                const parts = node.astext().split(RegExps.classifierDelimiterRegexp);
                if (parts.length === 1) {
                    nodeList[nodeList.length - 1].add(node);
                } else {
                    const text = parts[0].trimRight();
                    const textnode = new nodes.Text(unescape(text, true));
                    nodeList[nodeList.length - 1].add(textnode);
                    parts.slice(1).forEach((part) => {
                        nodeList.push(
                            new nodes.classifier(unescape(part, false), part),
                        );
                    });
                }
            } else {
                nodeList[nodeList.length - 1].add(node);
            }
        });
        return [nodeList, messages];
    }
}
Text.stateName = 'Text';
Text.constructor.stateName = 'Text';
export default Text;
