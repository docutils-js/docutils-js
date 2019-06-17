import StateWS from "../../../states/StateWS";
import NestedStateMachine from "../NestedStateMachine";
import * as nodes from "../../../nodes";
import { EOFError, InvalidArgumentsError } from "../../../Exceptions";
import {
    Document,
    ElementInterface,
    NodeInterface,
    StateInterface,
    Systemmessage,
    TransitionsArray
} from "../../../types";
import StringList from "../../../StringList";
import Inliner from "../Inliner";
import RSTStateMachine from "../RSTStateMachine";
import { Explicit, InlinerInterface, NestedParseArgs, RstMemo, RSTStateArgs } from "../types";

abstract class RSTState extends StateWS {
    public static stateName: string;

    private nestedSmCache: any[] = [];


    public explicit: Explicit = {};
    public memo?: RstMemo;
    public inliner?: InlinerInterface;
    protected parent?: ElementInterface;

    protected rstStateMachine: RSTStateMachine;
    public document?: Document;
    protected stateClasses?: string[];
    public messages: NodeInterface[] = [];

    public blankFinish?: boolean;

    public doubleWidthPadChar: string = '';

    public constructor(stateMachine: RSTStateMachine, args: any) {
        super(stateMachine, args);
        this.rstStateMachine = stateMachine;
    }

    // fixme this whole thing needs rework
    public _init(stateMachine: RSTStateMachine, args: RSTStateArgs) {
        super._init(stateMachine, args);
        this.rstStateMachine = stateMachine;
        this.nestedSm = NestedStateMachine;
        this.nestedSmCache = [];
        this.stateClasses = args.stateClasses || [];

        this.nestedSmKwargs = {
            stateFactory: this.rstStateMachine.stateFactory.withStateClasses(this.stateClasses),
            initialState: 'Body',
            debug: args && stateMachine ? stateMachine.debug : false,
            /* eslint-disable-next-line no-console */
            debugFn: args && stateMachine ? stateMachine.debugFn : console.log,
        };
    }

    public runtimeInit() {
        super.runtimeInit();
        const {memo} = this.rstStateMachine;
        this.memo = memo;
        if(!memo) {
            throw new Error('need memo')
        }
        this.reporter = memo!.reporter;
        this.inliner = memo!.inliner;
        this.document = memo!.document;
        this.parent = this.rstStateMachine.node;
        if (!this.reporter!.getSourceAndLine) {
            //this.reporter!.getSourceAndLine = this.rstStateMachine.getSourceAndLine;
        }
    }

    public gotoLine(absLineOffset: number): void {
        try {
            this.rstStateMachine.gotoLine(absLineOffset);
        } catch (ex) {
            /* test for eof error? */
        }
    }

    /* istanbul ignore next */
    noMatch(context: any[], transitions: TransitionsArray|undefined): [{}[], (string | StateInterface | undefined), {}[]] {
        this.reporter!.severe(`Internal error: no transition pattern match.  State: "${this.constructor.name}"; transitions: ${transitions}; context: ${context}; current line: ${this.rstStateMachine.line}.`);
        return [context, undefined, []];
    }

    public bof(): string[][] {
        return [[], []];
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars
    public nestedParse(args: NestedParseArgs) {
        /* istanbul ignore if */
        if (!this.memo || !this.memo.document) {
            throw new Error('need memo');
        }
        /* istanbul ignore if */
        const block = args.inputLines;
        if (!block) {
            throw new Error('need block');
        }

        const mCopy = {...args};
        let useDefault = 0;
        if (!mCopy.stateMachineClass) {
            mCopy.stateMachineClass = this.nestedSm;
            useDefault += 1;
        }
        if (!mCopy.stateMachineKwargs) {
            mCopy.stateMachineKwargs = this.nestedSmKwargs;
            useDefault += 1;
        }
        const blockLength = block.length;

        let stateMachine;
        if (useDefault === 2 && this.nestedSmCache.length > 0) {
            stateMachine = this.nestedSmCache.pop();
        }

        if (!stateMachine) {

            if (!mCopy.stateMachineKwargs!.stateFactory) {
                throw new Error('need statefactory');
            }
            stateMachine = new mCopy.stateMachineClass({

                debug: this.debug,
                ...mCopy.stateMachineKwargs,
            });
        }
        stateMachine.run({
            inputLines: block,
            inputOffset: mCopy.inputOffset,
            memo: this.memo,
            node: mCopy.node,
            matchTitles: mCopy.matchTitles,
        });
        if (useDefault === 2) {
            this.nestedSmCache.push(stateMachine);
        } else {
            stateMachine.unlink();
        }
        const newOffset = stateMachine.absLineOffset();
        if (block.parent && (block.length - blockLength) !== 0) {
            this.rstStateMachine.nextLine(block.length - blockLength);
        }
        return newOffset;
    }

    public nestedListParse(block: StringList, args: NestedParseArgs): [ number, boolean ] {
        const myargs: NestedParseArgs = {...args};
        /* istanbul ignore next */
        if (myargs.extraSettings == null) {
            myargs.extraSettings = {};
        }
        if (!myargs.stateMachineClass) {
            myargs.stateMachineClass = this.nestedSm;
        }
        if (!myargs.stateMachineKwargs) {
            myargs.stateMachineKwargs = {...this.nestedSmKwargs};
        }
        myargs.stateMachineKwargs!.initialState = myargs.initialState;
        const stateMachine = new myargs.stateMachineClass({
            stateFactory: this.rstStateMachine.stateFactory,
            debug: this.debug,
            ...myargs.stateMachineKwargs,
        });
        if (!myargs.blankFinishState) {
            myargs.blankFinishState = myargs.initialState;
        }
        /* istanbul ignore if */
        if (!(myargs.blankFinishState! in stateMachine.states)) {
            throw new InvalidArgumentsError(`invalid state ${myargs.blankFinishState}`);
        }

        stateMachine.states[myargs.blankFinishState!].blankFinish = myargs.blankFinish;
        Object.keys(myargs.extraSettings).forEach((key) => {
            stateMachine.states[myargs.initialState][key] = myargs.extraSettings[key];
        });
        stateMachine.run({
            inputLines: block,
            inputOffset: myargs.inputOffset,
            memo: this.memo,
            node: myargs.node,
            matchTitles: myargs.matchTitles,
        });
        const {blankFinish} = stateMachine.states[myargs.blankFinishState!];
        stateMachine.unlink();
        return [stateMachine.absLineOffset(), blankFinish];
    }

    public section(args: {
        title: string; source: string; style: any | any[]; lineno: number; messages: Systemmessage[];
    }): void {
        const { source, style, title, lineno, messages } = args;
        if (this.checkSubsection({source, style, lineno})) {
            this.newSubsection({title, lineno, messages});
        }
    }

    public checkSubsection(args: { source: string; style: any | any[]; lineno: number}): boolean {
        const { source, style, lineno } = args;
        const memo = this.memo!;
        const titleStyles: any[] = memo.titleStyles;
        //        console.log(titleStyles);
        const mylevel = memo.sectionLevel;
        let level = 0;
        level = titleStyles.findIndex(tStyle => (style.length === 1 ? tStyle.length === 1
            && tStyle[0] === style[0] : style.length === 2
            && tStyle.length === 2
            && tStyle[0] === style[0] && tStyle[1]
            === style[1])) + 1;

        if (level === 0) {
            if (titleStyles.length === memo.sectionLevel) { // new subsection
                titleStyles.push(style);
                return true;
            }
            this.parent!.add(this.title_inconsistent(source, lineno));
            return false;
        }
        if (level <= mylevel) { //            // sibling or supersection
            memo.sectionLevel = level; // bubble up to parent section
            if (style.length === 2) {
                memo.sectionBubbleUpKludge = true;
            }
            // back up 2 lines for underline title, 3 for overline title
            this.rstStateMachine.previousLine(style.length + 1);
            throw new EOFError(); // let parent section re-evaluate
        }

        if (level === mylevel + 1) { // immediate subsection
            return true;
        }
        this.parent!.add(this.title_inconsistent(source, lineno));
        return false;
    }

    /* eslint-disable-next-line @typescript-eslint/camelcase,camelcase */
    public title_inconsistent(sourcetext: string, lineno: number) {
        const error = this.reporter!.severe(
            'Title level inconsistent:', [new nodes.literal_block('', sourcetext)], {line: lineno},
        );
        return error;
    }


    public newSubsection(args: {title: string; lineno: number; messages: Systemmessage[];}) {
        const { title, lineno, messages} = args;
        const memo = this.memo!;
        const myLevel = memo.sectionLevel;
        memo.sectionLevel += 1;
        const sectionNode = new nodes.section();
        this.parent!.add(sectionNode);
        const [textNodes, titleMessages] = this.inline_text(title, lineno);
        const titleNode = new nodes.title(title, '', textNodes);
        const name = nodes.fullyNormalizeName(titleNode.astext());
        sectionNode.attributes.names.push(name);
        sectionNode.add(titleNode);
        sectionNode.add(messages);
        sectionNode.add(titleMessages);
        this.document!.noteImplicitTarget(sectionNode, sectionNode);
        const offset = this.rstStateMachine.lineOffset + 1;
        const absoffset = this.rstStateMachine.absLineOffset() + 1;
        const newabsoffset = this.nestedParse(
            {
                inputLines: this.rstStateMachine.inputLines.slice(offset) as StringList,
                inputOffset: absoffset,
                node: sectionNode as NodeInterface,
                matchTitles: true,
            }
        );
        this.gotoLine(newabsoffset);
        if (memo.sectionLevel <= myLevel) {
            throw new EOFError();
        }

        memo.sectionLevel = myLevel;
    }

    public unindentWarning(nodeName: string): NodeInterface {
        const lineno = this.rstStateMachine.absLineNumber() + 1;
        return this.reporter!.warning(`${nodeName} ends without a blank line; unexpected unindent.`, [], {line: lineno});
    }

    public paragraph(lines: string[], lineno: number): any[] {
        const data = lines.join('\n').trimRight();
        let text;
        let literalNext;
        if (/(?<!\\)(\\\\)*::$/.test(data)) {
            if (data.length === 2) {
                return [[], 1];
            }
            if (' \n'.indexOf(data[data.length - 3]) !== -1) {
                text = data.substring(0, data.length - 3).replace(/\s*$/, '');
            } else {
                text = data.substring(0, data.length - 1);
            }
            literalNext = 1;
        } else {
            text = data;
            literalNext = 0;
        }
        const r = this.inline_text(text, lineno);
        const [textnodes, messages] = r;
        const p = new nodes.paragraph(data, '', textnodes);
        let sourceAndLine = this.rstStateMachine.getSourceAndLine(lineno);
        p.source = sourceAndLine[0];
        if(sourceAndLine[1] !== undefined) {
            p.line = sourceAndLine[1];
        }
        return [[p, ...messages], literalNext];
    }

    /* eslint-disable-next-line @typescript-eslint/camelcase,camelcase */
    public inline_text(text: string, lineno: number) {
        const r = this.inliner!.parse(text, {lineno, memo: this.memo, parent: this.parent!});
        return r;
    }
}

export default RSTState;
