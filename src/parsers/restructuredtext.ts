import BaseParser from '../Parser';
import * as statemachine from '../StateMachine';
import RSTStateMachine from './rst/RSTStateMachine';
import StateFactory from './rst/StateFactory';
import {Document, ParserArgs} from "../types";
import { InlinerInterface } from "./rst/types";
import { InvalidStateError } from "../Exceptions";

class Parser extends BaseParser {
    private inliner?: InlinerInterface;
    private initialState: string;
    private stateMachine?: RSTStateMachine;
    public constructor(args: ParserArgs = {}) {
        super(args);
        this.configSection = 'restructuredtext parser';
        this.configSectionDependencies = ['parsers'];
        if (args.rfc2822) {
            this.initialState = 'RFC2822Body';
        } else {
            this.initialState = 'Body';
        }

        if(args.inliner !== undefined) {
            this.inliner = args.inliner;
        }
    }

    public parse(inputstring: string, document: Document): void {
        if(!inputstring.split) {
            throw new Error('not a string');
        }
        if (!inputstring) {
            throw new Error('need input for rst parser');
        }

        this.setupParse(inputstring, document);

        this.stateMachine = new RSTStateMachine({
            stateFactory: new StateFactory(),
            initialState: this.initialState,
            debugFn: this.debugFn,
            debug: document.reporter.debugFlag,
        });
        if(document.settings.docutilsParsersRstParser === undefined) {
            throw new InvalidStateError(('need document and config for rstparser'));
        }
        let tabWidth = document.settings.docutilsParsersRstParser.tabWidth;
        const inputLines = statemachine.string2lines(
            inputstring, {
                tabWidth: tabWidth,
                convertWhitespace: true,
            },
        );

        //      console.log(`initial state is ${this.initialState}`);
        if(this.stateMachine.debug) {
            console.log('fo')
        }
        this.stateMachine.run({ inputLines, document,
            inputOffset: 0,
            inliner: this.inliner });
        this.finishParse();
    }

    public finishParse(): void {
    }

}

export { Parser as RSTParser };

export default Parser;
