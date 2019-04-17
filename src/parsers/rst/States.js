import * as statemachine from '../../StateMachine';
import * as nodes from '../../nodes';
import * as directives from './directives';
import * as tableparser from './tableparser';
import RSTState from './states/RSTState';
import {
  columnWidth, isIterable, escape2null, splitEscapedWhitespace,
} from '../../utils';
import unescape from '../../utils/unescape';


/* import RSTStateMachine from './RSTStateMachine';
import Inliner from './Inliner'; */

import {
 ApplicationError, DataError, EOFError, InvalidArgumentsError, UnimplementedError as Unimp,
} from '../../Exceptions';

const nonWhitespaceBefore = '(?<!\\s)';
const nonWhitespaceEscapeBefore = '(?<![\\s\\x00])';
const nonUnescapedWhitespaceEscapeBefore = '(?<!(?<!\\x00)[\\s\\x00])';
const nonWhitespaceAfter = '(?!\\s)';
const classifierDelimiterRegexp = new RegExp(' +: +');
const simpleTableBorderPat = /=+[ =]*$/;
const gridTableTopPat = /\+-[-+]+-\+ *$/;
const emailPattern = '%(emailc)s+(?:\.%(emailc)s+)*(?<!\x00)@%(emailc)s+(?:\.%(emailc)s*)*%(uri_end)s';
// email=re.compile(self.email_pattern % args + '$',
//                 re.VERBOSE | re.UNICODE),

const { StringList } = statemachine;

const nonalphanum7bit = '[!-/:-@[-`{-~]';
const simplename = '\\w+';

const normalizeName = nodes.fullyNormalizeName;

const { StateMachineWS } = statemachine;
const { StateWS } = statemachine;

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}






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
