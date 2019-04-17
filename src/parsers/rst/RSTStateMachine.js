import StateMachineWS from '../../StateMachineWS';
import Inliner from './Inliner';
import * as languages from '../../languages';


class RSTStateMachine extends StateMachineWS {
    run({
 inputLines, document, inputOffset, matchTitles, inliner,
    }) {
        /* istanbul ignore if */
        if (inputOffset === undefined) {
            inputOffset = 0;
        }
        /* istanbul ignore if */
        if (!document) {
            throw new Error('need document');
        }

        /* istanbul ignore next */
        if (matchTitles === undefined) {
            matchTitles = true;
        }
        this.language = languages.getLanguage(document.settings.languageCode);
        this.matchTitles = matchTitles;
        /* istanbul ignore next */
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
        /* istanbul ignore if */
        if (results.length !== 0) {
            throw new Error('should be empty array return from statemachine.run');
        }
        this.node = undefined;
        this.memo = undefined;
    }
}

export default RSTStateMachine;
