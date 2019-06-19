import { getLanguage } from "./languages";
import { CoreLanguage, Document, NodeInterface, TransformInterface } from "./types";


export default abstract class Transform implements TransformInterface {
    public document: Document;
    public startNode?: NodeInterface;
    public language?: CoreLanguage;
    public static defaultPriority: number;
    public constructor(document: Document, startNode?: NodeInterface) {
        this.document = document;
        this.startNode = startNode;
        let languageCode = document.settings.docutilsCoreOptionParser.languageCode;
        if(languageCode !== undefined) {
            this.language = getLanguage(languageCode,
                document.reporter);
        }
        this._init(document, startNode);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public _init(document: Document, startNode: NodeInterface | undefined): void {

    }

    public abstract apply(): void;
}
