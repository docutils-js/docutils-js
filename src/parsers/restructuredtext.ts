import BaseParser from '../Parser';
import * as statemachine from '../StateMachine';
import RSTStateMachine from './rst/RSTStateMachine';
import StateFactory from './rst/StateFactory';
import {Document, ParserArgs, SettingsSpecType, LoggerType} from "../types";
import { InlinerInterface } from "./rst/types";
import { InvalidStateError } from "../Exceptions";
import { validateBoolean, validateTernary } from '../Frontend';

const settingsSpec: SettingsSpecType[] = [
    [
        "reStructuredText Parser Options",
        null,
        [
            [
                "Recognize and link to standalone PEP references (like \"PEP 258\").",
                [
                    "--pep-references"
                ],
                {
                    "action": "validating",
                    "delegatedAction": "storeTrue",
                    "validator": validateBoolean,
                    nargs: 0
                }
            ],
            [
                "Base URL for PEP references (default \"http://www.python.org/dev/peps/\").",
                [
                    "--pep-base-url"
                ],
                {
                    "metavar": "<URL>",
                    "default": "http://www.python.org/dev/peps/",
                    "validator": "validate_url_trailing_slash"
                }
            ],
            [
                "Template for PEP file part of URL. (default \"pep-%04d\")",
                [
                    "--pep-file-url-template"
                ],
                {
                    "metavar": "<URL>",
                    "default": "pep-%04d"
                }
            ],
            [
                "Recognize and link to standalone RFC references (like \"RFC 822\").",
                [
                    "--rfc-references"
                ],
                {
                    "action": "store_true",
                    "validator": validateBoolean
                }
            ],
            [
                "Base URL for RFC references (default \"http://tools.ietf.org/html/\").",
                [
                    "--rfc-base-url"
                ],
                {
                    "metavar": "<URL>",
                    "default": "http://tools.ietf.org/html/",
                    "validator": "validate_url_trailing_slash"
                }
            ],
            [
                "Set number of spaces for tab expansion (default 8).",
                [
                    "--tab-width"
                ],
                {
                    "metavar": "<width>",
                    "type": "int",
                    "default": 8,
                    "validator": "validate_nonnegative_int"
                }
            ],
            [
                "Remove spaces before footnote references.",
                [
                    "--trim-footnote-reference-space"
                ],
                {
                    "action": "store_true",
                    "validator": validateBoolean
                }
            ],
            [
                "Leave spaces before footnote references.",
                [
                    "--leave-footnote-reference-space"
                ],
                {
                    "action": "store_false",
                    "dest": "trim_footnote_reference_space"
                }
            ],
            [
                "Disable directives that insert the contents of external file (\"include\" & \"raw\"); replaced with a \"warning\" system message.",
                [
                    "--no-file-insertion"
                ],
                {
                    "action": "store_false",
                    "default": 1,
                    "dest": "file_insertion_enabled",
                    "validator": validateBoolean
                }
            ],
            [
                "Enable directives that insert the contents of external file (\"include\" & \"raw\").  Enabled by default.",
                [
                    "--file-insertion-enabled"
                ],
                {
                    "action": "store_true"
                }
            ],
            [
                "Disable the \"raw\" directives; replaced with a \"warning\" system message.",
                [
                    "--no-raw"
                ],
                {
                    "action": "store_false",
                    "default": 1,
                    "dest": "raw_enabled",
                    "validator": validateBoolean
                }
            ],
            [
                "Enable the \"raw\" directive.  Enabled by default.",
                [
                    "--raw-enabled"
                ],
                {
                    "action": "store_true"
                }
            ],
            [
                "Token name set for parsing code with Pygments: one of \"long\", \"short\", or \"none (no parsing)\". Default is \"long\".",
                [
                    "--syntax-highlight"
                ],
                {
                    "choices": [
                        "long",
                        "short",
                        "none"
                    ],
                    "default": "long",
                    "metavar": "<format>"
                }
            ],
            [
                "Change straight quotation marks to typographic form: one of \"yes\", \"no\", \"alt[ernative]\" (default \"no\").",
                [
                    "--smart-quotes"
                ],
                {
                    "default": false,
                    "metavar": "<yes/no/alt>",
                    delegatedAction: "store",
                    "validator": validateTernary,
                }
            ],
            [
                "Characters to use as \"smart quotes\" for <language>. ",
                [
                    "--smartquotes-locales"
                ],
                {
                    "metavar": "<language:quotes[,language:quotes,...]>",
                    "action": "append",
                    "validator": "validate_smartquotes_locales"
                }
            ],
            [
                "Inline markup recognized at word boundaries only (adjacent to punctuation or whitespace). Force character-level inline markup recognition with \"\\ \" (backslash + space). Default.",
                [
                    "--word-level-inline-markup"
                ],
                {
                    "action": "store_false",
                    "dest": "character_level_inline_markup"
                }
            ],
            [
                "Inline markup recognized anywhere, regardless of surrounding characters. Backslash-escapes must be used to avoid unwanted markup recognition. Useful for East Asian languages. Experimental.",
                [
                    "--character-level-inline-markup"
                ],
                {
                    "action": "store_true",
                    "default": false,
                    "dest": "character_level_inline_markup"
                }
            ]
        ]
    ]
];

class Parser extends BaseParser {
    public static settingsSpec: SettingsSpecType[] = settingsSpec;
    public settingsSpec: SettingsSpecType[] = settingsSpec;
    private inliner?: InlinerInterface;
    private initialState: string;
    private stateMachine?: RSTStateMachine;
    public constructor(args: ParserArgs) {
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
            stateFactory: new StateFactory({logger: this.logger}),
            initialState: this.initialState,
            debugFn: this.debugFn,
            debug: document.reporter.debugFlag,
	    logger: this.logger,
        });
        let tabWidth = document.settings.tabWidth;
        const inputLines = statemachine.string2lines(
            inputstring, {
                tabWidth: tabWidth,
                convertWhitespace: true,
            },
        );

        //      console.log(`initial state is ${this.initialState}`);
        this.stateMachine.run( inputLines, 0, undefined,
            undefined, undefined, document, true,this.inliner);
        this.finishParse();
    }

    public finishParse(): void {
    }

}

Parser.settingsSpec = settingsSpec;
export { Parser as RSTParser };

export default Parser;
