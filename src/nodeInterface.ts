interface SourceLocation {
   currentSource: string;
   currentLine: number;
}

interface HasIndent {
    indent: any;
}

interface INode {
    /** Back-reference to the Node immediately containing this Node. */
    parent: INode;
    /** The `document` node at the root of the tree containing this Node. */
    document: IDocument;
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
    walk(any): boolean;
    walkabout(any): boolean;

    tagname: string;
    classTypes: any[];
    children: INode[];

    traverse(args: { condition: any, includeSelf: boolean, descend: boolean, siblings: boolean, ascend: boolean });

    astext(): string;
}

interface IAttributes {
    [propName: string]: any;
}

interface IElement extends INode {
    nodeName: any;
    attributes: IAttributes;
    listAttributes: string[];
}

interface ITextElement extends IElement {
}

interface IDocument extends IElement, SourceLocation {
    reporter: any;
    settings: any;

    noteTransformMessage(message: any);
}

export {
    INode,
    IElement,
    ITextElement, IDocument,
    IAttributes,
    HasIndent
};
