import Component from './Component';
import { UnimplementedError } from './Exceptions';
import {Document, ParserArgs} from "./types";

abstract class Parser extends Component {
    protected debugFn: any;
    protected debug: boolean;

    public constructor(args: ParserArgs = {}) {
        super();
        this.componentType = 'parser';
        this.configSection = 'parsers';
        this.debug = args.debug || false;
        this.debugFn = args.debugFn;
    }

    /* istanbul ignore function */
    /* eslint-disable-next-line no-unused-vars */
    abstract parse(inputstring: string, document: Document): any | any[] | void;
    /* eslint-disable-next-line no-unused-vars */
    public setupParse(inputstring: string, document: Document): void {
    } ;
    abstract finishParse(): void;

}

export default Parser;
