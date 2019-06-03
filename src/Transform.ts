import getLanguage from './languages';
import { IDocument, INode } from './nodeInterface';

export default class Transform {
    document: IDocument;
    startNode: INode;
    language: any;
    constructor(document, startNode) {
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
