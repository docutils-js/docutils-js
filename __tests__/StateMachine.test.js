import { StateMachine, StateWS, StringList } from '../src/StateMachine';

class MockStateMachine {
    constructor(args) {
	if (!args.hasOwnProperty('runResult')) {
	    console.log(Object.keys(args));
	    throw new Error();
	}
	this.runResult = args.runResult;
    }

    run({
 inputLines, inputOffset, context, inputSource, initialState,
}) {
	return this.runResult;
    }
}


class State1 extends StateWS {
    _init() {
	super._init();
	this.indentSmKwargs = { runResult: [] };
	// I think this needs stateclasses and ohter stuff ???
	this.nestedSmKwargs = { runResult: [] };
	this.indentSm = MockStateMachine;
	this.nestedSm = MockStateMachine;
    }
}

class State2 extends StateWS {
    _init() {
	super._init();
	this.indentSmKwargs = { runResult: [] };
	// I think this needs stateclasses and ohter stuff ???
	this.nestedSmKwargs = { runResult: [] };
	this.indentSm = MockStateMachine;
	this.nestedSm = MockStateMachine;
    }
}

class State3 extends StateWS {
    _init() {
	super._init();
	this.indentSmKwargs = { runResult: [] };
	// I think this needs stateclasses and ohter stuff ???
	this.nestedSmKwargs = { runResult: [] };
	this.indentSm = MockStateMachine;
	this.nestedSm = MockStateMachine;
    }
}

function createStateMachine() {
    const stateClasses = [State1];
    const initialState = 'State1';
    return new StateMachine({ stateClasses, initialState });
}

test.each([['test', 'test']])('%s', (name, raw) => {
    try {
	const sot = createStateMachine();
	const r = sot.run({
 context: [],
			    inputLines: new StringList(['test']),
});
	console.log(r);
    } catch (error) {
	console.log(error.stack);
	console.log(error.message);
	throw error;
    }
});


test('StateWS indent', () => {
    const indented = new StringList([]);
    const indent = 2;
    const offset = 0;
    const blankFinish = true;
    class TestIndentStateMachine extends MockStateMachine {
	getIndented({
 start, untilBlank, stripIndent, blockIndent, firstIndent,
}) {
	    return [indented, indent, offset, blankFinish];
	}
    }

    const magicArray = ['Magic array'];
    const stateMachine = new TestIndentStateMachine({ runResult: magicArray });
    const indentResult = ['Indent'];

    const TestState = class extends StateWS {
	_init() {
	    super._init();
	    console.log('settig indentSmKwargs');
	    this.indentSmKwargs = { runResult: indentResult };
	    this.nestedSmKwargs = { runResult: indentResult }; // I think this needs stateclasses and oter stuff ???
	    this.indentSm = MockStateMachine;
	    this.nestedSm = MockStateMachine;
	}
    };
    const state = new TestState({
 stateMachine,
				  debug: true,
});
    let match; const
context = [];
    const nextState = 'random';
    const r = state.indent(match, context, nextState);
    expect(r).toHaveLength(3);
    const [resultContext, resultNextState, resultResults] = r;
    expect(resultContext).toBe(context);
    expect(resultNextState).toBe(nextState);
    expect(resultResults).toBeDefined();
    expect(resultResults).toBe(indentResult);
    //    resultResults is the return value from the indent state machine
});
