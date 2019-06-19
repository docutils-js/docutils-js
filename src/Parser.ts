import Component from "./Component";
import { DebugFunction, Document, ParserArgs } from "./types";

abstract class Parser extends Component {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public debugFn: DebugFunction = (msg: string): void => {};
    protected debug: boolean;

    public constructor(args: ParserArgs = {}) {
        super();
        this.componentType = 'parser';
        this.configSection = 'parsers';
        this.debug = args.debug || false;
        if(args.debugFn !== undefined) {
            this.debugFn = args.debugFn;
        }
    }

    /* istanbul ignore function */
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
    abstract parse(inputstring: string, document: Document): void;
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
    public setupParse(inputstring: string, document: Document): void {
    } ;
    abstract finishParse(): void;

}

export default Parser;
