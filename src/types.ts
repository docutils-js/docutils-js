/**
 * Runtime transform specification base class.
 *
 * TransformSpec subclass objects used by `docutils.transforms.Transformer`.
 */
import {citation, Element, footnote, reference} from "./nodes";
import {Settings} from "../gen/Settings";
import State from "./states/State";
import StringList from "./StringList";
import Inliner from "./parsers/rst/Inliner";
import Transformer from "./Transformer";

export interface ParserArgs
{
    inliner?: Inliner;
    rfc2822?: boolean;
    debug?: boolean;
    debugFn?: any;
}

export interface ISettings {
    getSettings(name: string): any;
}

export interface SourceLocation {
    currentSource: string;
    currentLine: number;
}

export interface HasIndent {
    indent: any;
}

export interface INode extends SourceLocation {
    referenced: boolean;
    names: any[];
    refname?: string;
    refid?: string;
    rawsource: string;
    /** Back-reference to the Node immediately containing this Node. */
    parent?: INode;
    /** The `document` node at the root of the tree containing this Node. */
    document?: Document;
    /** Path or description of the input source which generated this Node. */
    source: string;
    /** The line number (1-based) of the beginning of this Node in `source`. */
    line: number;

    attributes: IAttributes;

    asDOM(dom: any): any;

    /**
     * Return an indented pseudo-XML representation, for test purposes.
     *
     * Override in subclasses.
     */
    pformat(indent: string, level: number): string;

    /** Return a copy of self. */
    copy(): INode;

    /** Return a deep copy of self (also copying children). */
    deepcopy(): INode;

    /**
     * Traverse a tree of `Node` objects, calling the
     * `dispatch_visit()` method of `visitor` when entering each
     * node.  (The `walkabout()` method is similar, except it also
     * calls the `dispatch_departure()` method before exiting each
     * node.)
     *
     * This tree traversal supports limited in-place tree
     * modifications.  Replacing one node with one or more nodes is
     *
     * OK, as is removing an element.  However, if the node removed
     * or replaced occurs after the current node, the old node will
     * still be traversed, and any new nodes will not.
     * Within ``visit`` methods (and ``depart`` methods for
     * `walkabout()`), `TreePruningException` subclasses may be raised
     *
     * (`SkipChildren`, `SkipSiblings`, `SkipNode`, `SkipDeparture`).
     * Parameter `visitor`: A `NodeVisitor` object, containing a
     * ``visit`` implementation for each `Node` subclass encountered.
     * Return true if we should stop the traversal.
     */
    walk(visitor: any): boolean;

    walkabout(visitor: any): boolean;

    tagname: string;
    classTypes: any[];
    children: INode[];

    // eslint-disable-next-line max-len
    traverse(args: { condition?: any; includeSelf?: boolean; descend?: boolean; siblings?: boolean; ascend?: boolean }): any[];

    astext(): string;

    add(iNodes: INode[] | INode): void;

    isInline(): boolean;

    starttag(quoteattr?: any): string;

    endtag(): string;

    emptytag(): string;

    addBackref(prbid: any): void;

    /**
     Updates all attributes from node or dictionary `dict_`.

     Appends the basic attributes ('ids', 'names', 'classes',
     'dupnames', but not 'source') and then, for all other attributes in
     dict_, updates the same attribute in self.  When attributes with the
     same identifier appear in both self and dict_ whose values aren't each
     lists and replace is True, the values in self are replaced with the
     values in dict_; if the values from self and dict_ for the given
     identifier are both of list type, then the two lists are concatenated
     and the result stored in self; otherwise, the values in self are
     preserved.  When and_source is True, the 'source' attribute is
     included in the copy.

     NOTE: When replace is False, and self contains a 'source' attribute,
     'source' is not replaced even when dict_ has a 'source'
     attribute, though it may still be merged into a list depending
     on the value of update_fun.
     */
    updateAllAttsConcatenating(dict_: any, replace:  boolean,
        andSource: boolean): void;

    nextNode(args: TraverseArgs): INode | undefined | null;

    getCustomAttr(attrName: string): any[] | any | undefined| null;

    isAdmonition(): any;
}

export interface IAttributes {
    [propName: string]: any;
}

export interface IElement extends INode {
    nodeName: any;
    listAttributes: string[];
    firstChildNotMatchingClass(childClass: any | any[], start?: number, end?: number): number | undefined;
    attlist(): IAttributes;
}

export interface ITextElement extends IElement {
}

export interface Document extends IElement {
    transformMessages: any[];
    nameIds: any;
    noteSource: any;
    reporter: IReporter;
    settings: Settings;

    // eslint-disable-next-line camelcase
    transformer: Transformer;

    noteTransformMessage(message: any): void;

    noteImplicitTarget(target: any, msgnode: any): void;

    noteRefname(ref: reference): any;

    noteExplicitTarget(target: any, parent: any): any;

    noteIndirectTarget(target: any): any;

    setId(p: INode, msgnode?: IElement): any;

    noteFootnoteRef(refnode: any): any;

    noteSymbolFootnoteRef(refnode: any): any;

    noteCitationRef(refnode: any): void;

    noteAutofootnoteRef(refnode: any): void;

    noteSubstitutionRef(subrefNode: any, subrefText: any): void;

    noteSubstitutionDef(substitutionNode: any, subname: any, parent: IElement): void;

    noteAnonymousTarget(target: any): void;

    noteCitation(c: citation): void;

    noteFootnote(f: footnote): void;

    noteSymbolFootnote(f: footnote): void;

    noteAutofootnote(f: footnote): void;

    getDecoration(): any;
}

export interface ITransformSpec {
    /**
     * List of functions to try to resolve unknown references.  Unknown
     * references have a 'refname' attribute which doesn't correspond to any
     * target in the document.  Called when the transforms in
     * `docutils.tranforms.references` are unable to find a correct target.  The
     * list should contain functions which will try to resolve unknown
     * references, with the following signature::
     *
     * def reference_resolver(node):
     *     '''Returns boolean: true if resolved, false if not.'''
     *
     * If the function is able to resolve the reference, it should also remove
     * the 'refname' attribute and mark the node as resolved::
     *
     * del node['refname']
     * node.resolved = 1
     *
     * Each function must have a "priority" attribute which will affect the order
     * the unknown_reference_resolvers are run::
     *
     *     reference_resolver.priority = 100
     *
     * Override in subclasses.
     */
    unknownReferenceResolvers: any[];

    getTransforms(): ITransformSpec[];
}

/** Base interface for Docutils components. */
export interface IComponent extends ITransformSpec {
    componentType: string;
    supported: string[];

    /** Is `format` supported by this component?
     *
     * To be used by transforms to ask the dependent component if it supports
     * a certain input context or output format.
     */
    supports(format: string): boolean;
}

export enum LogLevel {
    DebugLevel = 0,
    InfoLevel,
    WarningLevel,
    SevereLevel,
    ErrorLevel,
};

export interface IReporter {
    reportLevel: number;
    getSourceAndLine?: (lineno?: number) => any[];

    debugFlag?: boolean;

    setConditions(): void;

    systemMessage(level: number, message: string | Error, children: Element[], attributes: IAttributes): INode;

    notifyObservers(message: string): void;

    attachObserver(observer: any): void;

    debug(...args: any[]): INode;

    info(...args: any[]): INode;

    warning(...args: any[]): INode;

    error(...args: any[]): INode;

    severe(...args: any[]): INode;
}

export interface IStateFactory {

    withStateClasses(strings: string[]): IStateFactory;

    createState(stateName: any, param2: any): State;

    getStateClasses(): string[];
}

export interface IStateMachine {

    unlink(): void;

    run(args: StateMachineRunArgs): any[];

    /**
     *         Return current state object; set it first if
     *         `next_state` given.  Parameter `next_state`: a string,
     *         the name of the next state.  Exception:
     *         `UnknownStateError` raised if `next_state` unknown.
     */
    getState(nextState: any): any;

    nextLine(n: number): any;

    isNextLineBlank(): boolean;

    atEof(): boolean;

    atBof(): boolean;

    previousLine(n: number): any;

    gotoLine(lineOffset: number): string | undefined;

    getSource(lineOffset: number): any;

    absLineOffset(): number;

    absLineNumber(): number;

    getSourceAndLine(lineno: number): any[];

    insertInput(inputLines: any, source: any): void;

    getTextBlock(flushLeft: boolean): any;

    checkLine(context: any[], state: any, transitions: any): any[] | any;

    addState(stateClass: any): void;

    addStates(stateClasses: any[]): void;

    runtimeInit(): void;

    error(): void;

    attachObserver(observer: any): void;

    detachObserver(observer: any): void;

    notifyObservers(): void;
}

export interface IState {


    runtimeInit(): void;

    addInitialTransitions(): void;

    addTransitions(names: any[], transitions: any[]): void;

    addTransition(name: any[], transition: any): void;

    removeTransition(name: any): void;

    makeTransition(name: string, nextState?: any): any[];

    makeTransitions(nameList: any[]): (any[] | {})[];
}

export interface StateMachineCommonArgs {
}

export interface StateMachineRunArgs extends StateMachineCommonArgs {
    inputLines: StringList | string | string[];
    inputOffset?: number;
    context?: any[];
    inputSource?: string;
    initialState?: string;
    memo?: any;
    node?: INode;
    matchTitles?: boolean;
    document?: Document;
    inliner?: any;
}

export interface GetIndentedArgs {
    start?: any;
    untilBlank?: boolean;
    stripIndent?: boolean;
    blockIndent?: number;
    firstIndent?: number;
    indent?: number;
    stripTop?: boolean;
}

export interface TraverseArgs {
    condition?: any;
    includeSelf?: boolean;
    descend?: boolean;
    siblings?: boolean;
    ascend?: boolean;
}


export interface IStateMachineWS extends IStateMachine {
    getIndented(labeled: GetIndentedArgs): any[];

    getKnownIndented(labeled: GetIndentedArgs): any[];

    getFirstKnownIndented(args: GetIndentedArgs): any[];
}

export interface ITransformer {
    document: Document;

    /**
     * apply the transforms
     */
    applyTransforms(): void;

    /**
     * Store multiple transforms, with default priorities.
     * @param {Array} transformList - Array of transform classes (not instances).
     */
    addTransforms(transformList: any[]): void;

    /**
     *
     * Return a string, `priority` combined with `self.serialno`.
     *
     * This ensures FIFO order on transforms with identical priority.
     */
    getPriorityString(class_: any, priority: number): string;

    addPending(pending: any, priority: any): void;
}
