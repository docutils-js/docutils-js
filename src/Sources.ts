interface SourceArgs {
    source: any;
    sourcePath: string;
    encoding: string;
}

export default class Source {
    private encoding: any;
    private source: any;
    private sourcePath: any;
    constructor(args: SourceArgs) {
        const { source, sourcePath, encoding } = args;
        this.source = source;
        this.sourcePath = sourcePath;
        this.encoding = encoding;
    }
}
