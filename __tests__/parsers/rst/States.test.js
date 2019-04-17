import { Body, stateClasses } from '../../../src/parsers/rst/States';
import { StringList } from '../../../src/StateMachine';

import RSTStateMachine from '../../../src/parsers/rst/RSTStateMachine';
jest.mock('../../../src/parsers/rst/RSTStateMachine');

beforeEach(() => {
    RSTStateMachine.mockClear();
});

function createRSTStateMachine() {
    const sm = new RSTStateMachine({ stateClasses,
				     initialState: 'Body',
				     debug: true,
				     debugFn: console.log,
				   });
    return sm;
}

function createBody(optSm) {
    const stateMachine = optSm || createRSTStateMachine();
    const body = new Body({
	stateMachine,
	debug: true,
    });
    return body;
}

test('Body patterns', () => {
    const body = createBody();
    /* Ensure body state patterns haven't changed. */
    RSTStateMachine.mockImplementation(({ indent, untilBlank, stripIndent }) => {
	return {
	    absLineNumber: () => 1,
	    getFirstKnownIndented: (...args) => [new StringList('hello'), indent, 0, true],
	};
    });
    expect(body.patterns).toMatchSnapshot();
});
    
test('Body constructor',
     () => {
	 const body = createBody();
     });


// '\\.\\.[ ]+_(?![ ]|$)'
// Regex for reference
// new RegExp(`^(_|(?!_)(\`?)(?![ \`])(.+?)${nonWhitespaceEscapeBefore})(?<!(?<!\\x00):)${nonWhitespaceEscapeBefore}[ ]?:([ ]+|$)`),
test('hyperlink_target, no args', () => {
    const body = createBody();
    expect(() => body.hyperlink_target()).toThrow();
});

test('explicit hyperlink_target, with arg (malformed)', () => {
    const hyperlinkSource = '.. _myname';
    const rgxp = new RegExp('\\.\\.[ ]+_(?![ ]|$)');
    const body = createBody();
    const match = rgxp.exec(hyperlinkSource);
    expect(() => body.hyperlink_target(match)).toThrow();
//    const [[target], blank_finish] = body.hyperlink_target(match);
});



test('explicit citation', () => {
    const hyperlinkSource = '.. [myCitation]';
    const rgxp = new RegExp(`\\.\\.[ ]+\\[(\w+)\\]([ ]+|$)`);
    const body = createBody();
    const match = rgxp.exec(hyperlinkSource);
    expect(() => body.citation(match)).toThrow();
//    const [[target], blank_finish] = body.hyperlink_target(match);
});
