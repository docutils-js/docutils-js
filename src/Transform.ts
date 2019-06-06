import { getLanguage } from './languages';
import {Document, INode} from "./types";


export default class Transform {
    document: Document;
    startNode: INode;
    language: any;
    static defaultPriority: number;
    constructor(document: Document, startNode?: INode) {
        this.document = document;
        this.startNode = startNode;
        this.language = getLanguage(document.settings.languageCode,
                                              document.reporter);
        this._init(document, startNode);
    }

    /* eslint-disable-next-line no-unused-vars */
    _init(...args) {
    }
}
