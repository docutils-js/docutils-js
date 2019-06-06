export default class Source {
    private encoding: any;
    private source: any;
    private sourcePath: any;
    constructor({ source, sourcePath, encoding }) {
        this.source = source;
        this.sourcePath = sourcePath;
        this.encoding = encoding;
    }
}
