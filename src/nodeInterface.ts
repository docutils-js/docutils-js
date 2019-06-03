import Settings from './Settings';

interface INode {
    tagname: string;
    parent: INode;
    document: IDocument;
    source: string;
    line: number;
    classTypes: any[];
    children: INode[];

    walkabout(any);

    _fastTraverse(any);

    _allTraverse();

    traverse(args: { condition: any, includeSelf: boolean, descend: boolean, siblings: boolean, ascend: boolean });

    _domNode(domroot: any): any;

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

interface IDocument extends IElement {
    reporter: any;
    settings: Settings;

    noteTransformMessage(message: any);
}

export {
    INode,
    IElement,
    ITextElement, IDocument,
    IAttributes
};
