import * as statemachine from '../../StateMachine';
import * as nodes from '../../nodes';

/* import RSTStateMachine from './RSTStateMachine';
import Inliner from './Inliner'; */

/* eslint-disable-next-line no-unused-vars */
const nonWhitespaceBefore = '(?<!\\s)';
/* eslint-disable-next-line no-unused-vars */
const nonWhitespaceEscapeBefore = '(?<![\\s\\x00])';
/* eslint-disable-next-line no-unused-vars */
const nonUnescapedWhitespaceEscapeBefore = '(?<!(?<!\\x00)[\\s\\x00])';
/* eslint-disable-next-line no-unused-vars */
const nonWhitespaceAfter = '(?!\\s)';
/* eslint-disable-next-line no-unused-vars */
const classifierDelimiterRegexp = new RegExp(' +: +');
/* eslint-disable-next-line no-unused-vars */
const simpleTableBorderPat = /=+[ =]*$/;
/* eslint-disable-next-line no-unused-vars */
const gridTableTopPat = /\+-[-+]+-\+ *$/;
/* eslint-disable-next-line no-unused-vars */
const emailPattern = '%(emailc)s+(?:\\.%(emailc)s+)*(?<!\x00)@%(emailc)s+(?:\\.%(emailc)s*)*%(uri_end)s';
// email=re.compile(self.email_pattern % args + '$',
//                 re.VERBOSE | re.UNICODE),

/* eslint-disable-next-line no-unused-vars */
const { StringList } = statemachine;

/* eslint-disable-next-line no-unused-vars */
const nonalphanum7bit = '[!-/:-@[-`{-~]';
/* eslint-disable-next-line no-unused-vars */
const simplename = '\\w+';

/* eslint-disable-next-line no-unused-vars */
const normalizeName = nodes.fullyNormalizeName;

/* eslint-disable-next-line no-unused-vars */
const { StateMachineWS } = statemachine;
/* eslint-disable-next-line no-unused-vars */
const { StateWS } = statemachine;


// SubstitutionDef];

/*    underline(match, context, nextState) {
        const overline = context[0]
        const blocktext = overline + '\n' + this.stateMachine.line
        const lineno = this.stateMachine.absLineNumber() - 1
//        if len(overline.rstrip()) < 4:
//            this.shortOverline(context, blocktext, lineno, 1)
        const msg = this.reporter.error(
              'Invalid section title or transition marker.',
            [new nodes.literal_block(blocktext, blocktext)],
            { line: lineno })
        this.parent.add(msg)
        return [[], 'Body', []]
    }
*/
