import StateMachineWS from '../../StateMachineWS';
import Inliner from './Inliner';
import * as languages from '../../languages';
import {ElementInterface, StateMachineRunArgs} from "../../types";
import { RSTLanguage, RstMemo } from "./types";
import { getLanguage } from "./languages";

/**
 * reStructuredText's master StateMachine.
 *
 * The entry point to reStructuredText parsing is the `run()` method.
 */
class RSTStateMachine extends StateMachineWS {
    public rstLanguage?: RSTLanguage;
    public matchTitles?: boolean;
    public node?: ElementInterface;
    public memo?: RstMemo;
    public run(args: StateMachineRunArgs): (string|{})[] {
        const cArgs = { ... args };
        /* istanbul ignore if */
        if (cArgs.inputOffset === undefined) {
            cArgs.inputOffset = 0;
        }
        /* istanbul ignore if */
        if (!cArgs.document) {
            throw new Error('need document');
        }

        const document = cArgs.document;
        /* istanbul ignore next */
        if (cArgs.matchTitles === undefined) {
            cArgs.matchTitles = true;
        }
        const languageCode = document.settings.docutilsCoreOptionParser.languageCode;
        if(languageCode !== undefined) {
            this.rstLanguage = getLanguage(languageCode);
        }
        this.matchTitles = cArgs.matchTitles;
        /* istanbul ignore next */
        if (cArgs.inliner === undefined) {
            cArgs.inliner = new Inliner(document);
        }
        cArgs.inliner.initCustomizations(document.settings);
        this.memo = {
            document,
            reporter: document.reporter,
            language: this.rstLanguage,
            titleStyles: [],
            sectionLevel: 0,
            sectionBubbleUpKludge: false,
            inliner: cArgs.inliner,
        };
        this.document = document;
        this.attachObserver(document.noteSource.bind(document));
        this.reporter = this.memo.reporter;
        this.node = document;
        const superArgs: StateMachineRunArgs =  {inputLines: cArgs.inputLines, inputOffset: cArgs.inputOffset, inputSource: this.document.source};
        const results = super.run(superArgs);

        /* istanbul ignore if */
        if (results.length !== 0) {
            throw new Error('should be empty array return from statemachine.run');
        }
        this.node = undefined;
        this.memo = undefined;

        return [];
    }
}

export default RSTStateMachine;
