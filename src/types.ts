/**
 * Runtime transform specification base class.
 *
 * TransformSpec subclass objects used by `docutils.transforms.Transformer`.
 */
import {Element, system_message} from "./nodes";

export interface SourceLocation {
   currentSource: string;
   currentLine: number;
}

export interface HasIndent {
    indent: any;
}

export interface INode extends SourceLocation {
    /** Back-reference to the Node immediately containing this Node. */
    parent: INode;
    /** The `document` node at the root of the tree containing this Node. */
    document: Document;
    /** Path or description of the input source which generated this Node. */
    source: string;
    /** The line number (1-based) of the beginning of this Node in `source`. */
    line: number;

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

    traverse(args: { condition: any, includeSelf: boolean, descend: boolean, siblings: boolean, ascend: boolean });

    astext(): string;

    add(iNodes: INode[] | INode): void;
}

export interface IAttributes {
    [propName: string]: any;
}

export interface IElement extends INode {
    nodeName: any;
    attributes: IAttributes;
    listAttributes: string[];
}

export interface ITextElement extends IElement {
}

export interface Document extends IElement {
    reporter: any;
    settings: any;

    // eslint-disable-next-line camelcase
    noteTransformMessage(message: system_message): void;
    noteImplicitTarget(target: any, msgnode: any): void;

}

export interface TransformSpec {
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
  getTransforms(): any[];
}

export interface Component extends TransformSpec {
  componentType: string;
  supported: string[];
  /** Is `format` supported by this component?
   *
   * To be used by transforms to ask the dependent component if it supports
   * a certain input context or output format.
   */
  supports(format: string): boolean;
}

export interface IReporter {
    getSourceAndLine: (lineno?: number) => any[];
setConditions(): void;

systemMessage(level: number, message: string, children: Element[], attributes: IAttributes): INode;
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
}
export interface IStateMachine {
    constructor(args: any): void;

    unlink(): void;

    run({
            inputLines, inputOffset, context, inputSource, initialState,
        }): any[];

    /**
     *         Return current state object; set it first if
     *         `next_state` given.  Parameter `next_state`: a string,
     *         the name of the next state.  Exception:
     *         `UnknownStateError` raised if `next_state` unknown.
     */
    getState(nextState): any;

    nextLine(n): any;

    isNextLineBlank(): boolean;

    atEof(): boolean;

    atBof(): boolean;

    previousLine(n): any;

    gotoLine(lineOffset: number): string;

    getSource(lineOffset: number): any;

    absLineOffset(): number;

    absLineNumber(): number;

    getSourceAndLine(lineno): any[];

    insertInput(inputLines, source): void;

    getTextBlock(flushLeft): any;

    checkLine(context, state, transitions): any[] | any;

    addState(stateClass): void;

    addStates(stateClasses): void;

    runtimeInit(): void;

    error(): void;

    attachObserver(observer): void;

    detachObserver(observer): void;

    notifyObservers(): void;
}
export interface IState {


    runtimeInit(): void;

    addInitialTransitions(): void;

    addTransitions(names, transitions): void;

    addTransition(name, transition): void;

    removeTransition(name): void;

    makeTransition(name: string, nextState?): any[];

    makeTransitions(nameList): (any[] | {})[];
}
