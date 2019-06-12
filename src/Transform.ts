import { getLanguage } from './languages';
import {Document, INode} from "./types";


export default class Transform {
    document: Document;
    startNode?: INode;
    language: any;
    static defaultPriority: number;
    public constructor(document: Document, startNode?: INode) {
        this.document = document;
        this.startNode = startNode;
        this.language = getLanguage(document.settings.docutilsCoreOptionParser!.languageCode,
            document.reporter);
        this._init(document, startNode);
    }

    public _init(document: Document, startNode: INode | undefined) {

    }
}
