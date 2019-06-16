/**
 * Runtime transform specification base class.
 *
 * TransformSpec subclass objects used by `docutils.transforms.Transformer`.
 */
// eslint-disable-next-line @typescript-eslint/camelcase
import { citation, decoration, Element, footnote, reference, substitution_definition } from "./nodes";
import { Settings } from "../gen/Settings";
import Transformer from "./Transformer";
import StringList from "./StringList";
import { InlinerInterface } from "./parsers/rst/types";

export interface ParserArgs
{
    inliner?: {};
    rfc2822?: boolean;
    debug?: boolean;
    debugFn?: DebugFunction;
}

export interface SettingsInterface {
    getSettings(name: string): {};
}

export interface WritableStream {
    write: (data: string) => void;
}

export interface SourceLocation {
    currentSource: string;
    currentLine: number;
}

export interface HasIndent {
    indent: number;
}

export interface QuoteattrCallback {
    (arg: string): string;
}

export interface NodeInterface extends SourceLocation {
    referenced: boolean;
    names: string[];
    refname?: string;
    refid?: string;
    rawsource: string;
    /** Back-reference to the Node immediately containing this Node. */
    parent?: NodeInterface;
    /** The `document` node at the root of the tree containing this Node. */
    document?: Document;
    /** Path or description of the input source which generated this Node. */
    source?: string;
    /** The line number (1-based) of the beginning of this Node in `source`. */
    line: number;

    attributes: Attributes;

    asDOM(dom: {}): {};

    /**
     * Return an indented pseudo-XML representation, for test purposes.
     *
     * Override in subclasses.
     */
    pformat(indent: string, level: number): string;

    /** Return a copy of self. */
    copy(): NodeInterface;

    /** Return a deep copy of self (also copying children). */
    deepcopy(): NodeInterface;

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
    walk(visitor: {}): boolean;

    walkabout(visitor: {}): boolean;

    tagname: string;
    classTypes: {}[];
    children: NodeInterface[];

    // eslint-disable-next-line max-len
    traverse(args: TraverseArgs): NodeInterface[];

    astext(): string;

    add(iNodes: NodeInterface[] | NodeInterface): void;

    isInline(): boolean;

    starttag(quoteattr?: QuoteattrCallback): string;

    endtag(): string;

    emptytag(): string;

    addBackref(prbid: {}): void;

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
    updateAllAttsConcatenating(dict_: {}, replace:  boolean,
        andSource: boolean): void;

    nextNode(args: TraverseArgs): NodeInterface | undefined | null;

    getCustomAttr(attrName: string): undefined;

    isAdmonition(): boolean;
}

export interface Attributes {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [propName: string]: any;
}

export interface ElementInterface extends NodeInterface {
    nodeName: string;
    listAttributes: string[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    firstChildNotMatchingClass(childClass: any | any[], start?: number, end?: number): number | undefined;
    attlist(): Attributes;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TextElementInterface extends ElementInterface {
}

export interface Document extends ElementInterface {
    transformMessages: {}[];
    nameIds: NameIds;

    reporter: ReporterInterface;
    settings: Settings;

    // eslint-disable-next-line @typescript-eslint/camelcase,camelcase
    transformer: Transformer;

    noteTransformMessage(message: Systemmessage): void;

    noteImplicitTarget(target: NodeInterface, msgnode: NodeInterface): void;

    noteRefname(ref: reference): void;

    noteExplicitTarget(target: NodeInterface, parent?: NodeInterface): void;

    noteIndirectTarget(target: NodeInterface): void;

    setId(p: NodeInterface, msgnode?: ElementInterface): string;

    noteFootnoteRef(refnode: NodeInterface): void;

    noteSymbolFootnoteRef(refnode: NodeInterface): void;

    noteCitationRef(refnode: NodeInterface): void;

    noteAutofootnoteRef(refnode: NodeInterface): void;

    noteSubstitutionRef(subrefNode: NodeInterface, subrefText: string): void;

    // eslint-disable-next-line @typescript-eslint/camelcase
    noteSubstitutionDef(substitutionNode: substitution_definition, subname: string, parent: ElementInterface): void;

    noteAnonymousTarget(target: NodeInterface): void;

    noteCitation(c: citation): void;

    noteFootnote(f: footnote): void;

    noteSymbolFootnote(f: footnote): void;

    noteAutofootnote(f: footnote): void;

    getDecoration(): decoration;

    noteSource(source: string | undefined, offset: number|undefined): void;
}

export interface TransformSpecInterface {
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
    unknownReferenceResolvers: {}[];

    getTransforms(): TransformType[];
}

/** Base interface for Docutils components. */
export interface ComponentInterface extends TransformSpecInterface {
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

export interface ReporterInterface {
    reportLevel: number;
    getSourceAndLine?: (lineno?: number) => [string, number] | undefined;

    debugFlag?: boolean;


    systemMessage(level: number, message: string | Error, children: Element[], attributes: Attributes): NodeInterface;


    attachObserver(observer: {}): void;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    debug(message: string | Error, children?: NodeInterface[], kwargs?: Attributes): NodeInterface | undefined;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    info(message: string | Error, children?: NodeInterface[], kwargs?: Attributes): NodeInterface;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    warning(message: string | Error, children?: NodeInterface[], kwargs?: Attributes): NodeInterface;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error(message: string | Error, children?: NodeInterface[], kwargs?: Attributes): NodeInterface;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    severe(message: string | Error, children?: NodeInterface[], kwargs?: Attributes): NodeInterface;
}

export interface Statefactory {

    withStateClasses(strings: (StateType|string)[]): Statefactory;

    createState(stateName: string, stateMachine: Statemachine): StateInterface;

    getStateClasses(): StateType[];
}

export interface Statemachine {

    unlink(): void;

    run(args: StateMachineRunArgs): (string|{})[];

    /**
     *         Return current state object; set it first if
     *         `next_state` given.  Parameter `next_state`: a string,
     *         the name of the next state.  Exception:
     *         `UnknownStateError` raised if `next_state` unknown.
     */
    getState(nextState?: string): StateInterface;

    nextLine(n: number): string| undefined;

    isNextLineBlank(): boolean;

    atEof(): boolean;

    atBof(): boolean;

    previousLine(n: number): string;

    gotoLine(lineOffset: number): string | undefined;

    getSource(lineOffset: number): string | undefined;

    absLineOffset(): number|undefined;

    absLineNumber(): number;

    getSourceAndLine(lineno: number): [string | undefined, number | undefined];

    insertInput(inputLines: StringList, source?: string): void;

    getTextBlock(flushLeft: boolean): StringList;
    addState(stateClass: StateInterface): void;

    addStates(stateClasses: StateInterface[]): void;

    runtimeInit(): void;

    error(): void;

    attachObserver(observer: {}): void;

    detachObserver(observer: {}): void;

    notifyObservers(): void;
}

export interface StateType {
    stateName: string;

}
export interface StateInterface {
    stateName: string;
    transitions: Transitions;

    runtimeInit(): void;

    addInitialTransitions(): void;

    addTransitions(names: string[], transitions: Transitions): void;

    addTransition(name: string, transition: StateInterface): void;

    removeTransition(name: string): void;

    makeTransition(name: string, nextState?: {}): {}[];

    makeTransitions(nameList: string[]): ({}[] | {})[];

    transitionOrder: string[];

    bof(context: (string|{})[]): string[][];
    eof(context: (string|{})[]): string[];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    noMatch(context: any[], transitions: TransitionsArray|undefined): [{}[], (string | StateInterface), {}[]];

}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface StateMachineCommonArgs {
}

export interface StateMachineRunArgs extends StateMachineCommonArgs {
    inputLines: StringList | string | string[];
    inputOffset: number;
    context?: {}[];
    inputSource?: string;
    initialState?: string;
    node?: NodeInterface;
    matchTitles?: boolean;
    document?: Document;
    inliner?: InlinerInterface;
}

export interface GetIndentedArgs {
    start?: number;
    untilBlank?: boolean;
    stripIndent?: boolean;
    blockIndent?: number;
    firstIndent?: number;
    indent?: number;
    stripTop?: boolean;
}

export interface Visitor {
    document: Document;

    // eslint-disable-next-line @typescript-eslint/camelcase
    dispatchVisit(node: NodeInterface): void;

    dispatchDeparture(node: NodeInterface): void;
}

export interface FastTraverseArg {
    new (): NodeInterface;
}

export interface TraverseArgs {
    // @ts-ignore
    condition?: any;
    includeSelf?: boolean;
    descend?: boolean;
    siblings?: boolean;
    ascend?: boolean;
}


export interface WhitespaceStatemachine extends Statemachine {
    getIndented(labeled: GetIndentedArgs): [StringList, number, number, boolean];

    getKnownIndented(labeled: GetIndentedArgs): [StringList, number, boolean];

    getFirstKnownIndented(args: GetIndentedArgs): [StringList, number, number, boolean];
}

export interface TransformerInterface {
    document: Document;

    /**
     * apply the transforms
     */
    applyTransforms(): void;

    /**
     * Store multiple transforms, with default priorities.
     * @param {Array} transformList - Array of transform classes (not instances).
     */
    addTransforms(transformList: TransformType[]): void;

    /**
     *
     * Return a string, `priority` combined with `self.serialno`.
     *
     * This ensures FIFO order on transforms with identical priority.
     */
    getPriorityString(class_: {}, priority: number): string;

    addPending(pending: NodeInterface, priority: number): void;
}
export interface DebugFunction {
    (line: string): void;
}

export interface SourceArgs {
    source: {};
    sourcePath: string;
    encoding: string;
}

export interface CoreLanguage {
    labels: {};
    bibliographicFields: {};
    authorSeparators: string[];
}

export interface ApplyFunction {
    (): void;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Systemmessage extends NodeInterface {
}

export interface NameIds {
    [name: string]: string | undefined;
}

export interface ObserverCallback {
    (source?: string, lineno?: number): void;
}

export interface Transitions {
    [name: string]: StateInterface;
}

export interface ReadCallback {
    (error: Error | undefined | {}, output: {} | undefined): void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TransformType {
    defaultPriority: number;
}

export interface Components {
    [componentName: string]: ComponentInterface;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TransformInterface {
    apply(): void;
}

export interface TransitionsArray {
    [index: number]: string|string[];
}
