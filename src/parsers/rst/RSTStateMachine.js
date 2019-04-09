import { StateMachineWS } from '../../StateMachine';
import Inliner from './Inliner';
import * as languages from '../../languages';


class RSTStateMachine extends StateMachineWS {
    run({
 inputLines, document, inputOffset, matchTitles, inliner,
}) {
        if(inputOffset === undefined) {
            inputOffset = 0;
        }
        if (!document) {
            throw new Error('need document');
        }

        if (matchTitles === undefined) {
            matchTitles = true;
        }
        this.language = languages.getLanguage(document.settings.languageCode);
        this.matchTitles = matchTitles;
        if (inliner === undefined) {
            inliner = new Inliner();
        }
        inliner.initCustomizations(document.settings);
        this.memo = {
	    document,
	    reporter: document.reporter,
	    language: this.language,
            titleStyles: [],
                      sectionLevel: 0,
                      sectionBubbleUpKludge: false,
                      inliner,
};
        this.document = document;
        this.attachObserver(document.noteSource.bind(document));
        this.reporter = this.memo.reporter;
        this.node = document;
        const results = super.run({ inputLines, inputOffset, inputSource: document.source });
        if (results.length !== 0) {
//          throw new Error("should be o");
        }
        this.node = this.memo = undefined;
    }
}

export default RSTStateMachine;
