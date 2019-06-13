import Body from '../../../../src/parsers/rst/states/Body';
import StringList from '../../../../src/StringList';
import RSTStateMachine from '../../../../src/parsers/rst/RSTStateMachine';
import StateFactory from '../../../../src/parsers/rst/StateFactory';

jest.mock('../../../../src/parsers/rst/RSTStateMachine');
jest.mock('../../../../src/parsers/rst/StateFactory');

beforeEach(() => {
    // @ts-ignore
    RSTStateMachine.mockClear();
    // @ts-ignore
    StateFactory.mockClear();
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
    // @ts-ignore
    RSTStateMachine.mockImplementation(({ indent, untilBlank, stripIndent }) => ({
        absLineNumber: () => 1,
        /* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
            getFirstKnownIndented: (...args: any[]) => [new StringList(['hello']), indent, 0, true],
        /* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
            stateFactory: { withStateClasses: (classes: any[]) => new StateFactory() },
        }));
});

function createRSTStateMachine() {
    const sm = new RSTStateMachine({
 stateFactory: new StateFactory()   ,
                                     initialState: 'Body',
        debug: true,
        /* eslint-disable-next-line no-console */
                                     debugFn: console.log,
                                   });
    return sm;
}

function createBody(optSm?: any) {
    const stateMachine = optSm || createRSTStateMachine();
    const body = new Body(stateMachine,
        { debug:  true,
    });
    return body;
}

test('Body patterns', () => {
    const body = createBody();
    /* Ensure body state patterns haven't changed. */
    expect(body.patterns).toMatchSnapshot();
});

test('Body constructor',
     () => {
         const body = createBody();
         expect(body).toBeDefined();
     });


// '\\.\\.[ ]+_(?![ ]|$)'
// Regex for reference
// new RegExp(`^(_|(?!_)(\`?)(?![ \`])(.+?)${nonWhitespaceEscapeBefore})
// (?<!(?<!\\x00):)${nonWhitespaceEscapeBefore}[ ]?:([ ]+|$)`),
test('hyperlink_target, no args', () => {
    const body = createBody();
    expect(() => body.hyperlink_target({})).toThrow();
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
    // fix this in original source
    const rgxp = new RegExp('\\.\\.[ ]+\\[(\\w+)\\]([ ]+|$)');
    const body = createBody();
    const match = rgxp.exec(hyperlinkSource);
    expect(() => body.citation(match)).toThrow();
//    const [[target], blank_finish] = body.hyperlink_target(match);
});
