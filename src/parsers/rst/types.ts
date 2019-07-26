import Inliner from "./Inliner";
import {
    ContextKind,
    Document,
    ElementInterface,
    LogLevel,
    NodeInterface,
    Options,
    Patterns,
    ReporterInterface,
    Statemachine,
    StateMachineConstructorArgs,
    StateMachineFactoryFunction,
    StateMachineRunArgs
} from "../../types";
import StringList from "../../StringList";
import { Settings } from "../../../gen/Settings";

export interface BodyState {
    footnote: (match: RegExpExecArray) => [NodeInterface[], boolean];
    citation: (match: RegExpExecArray) => [NodeInterface[], boolean];
    hyperlink_target: (match: RegExpExecArray) => [NodeInterface[], boolean];
    substitution_def: (match: RegExpExecArray) => [NodeInterface[], boolean];
    directive: (match: RegExpExecArray, optionPresets: Options) => [NodeInterface[], boolean];
}

export type RowData = TableEntryData[];
export type CellData = [number, number, number,number, StringList];
export type TableEntryData = [number, number, number, StringList];
export type TableData = [number[], RowData[], RowData[]]
export interface ParserConstructor {
    new (): any;
}

export interface DirectiveConstructor {
    new (typeName: string, args: string[], options: Options, content: StringList, lineno: number,
        contentOffset: number, blockText: string, u: any, stateMachine: Rststatemachine): any;

    optionalArguments: any;
    requiredArguments: any;
    optionSpec: any;
    hasContent: boolean;
    finalArgumentWhitespace: boolean;
}

interface ConstructCallback {
    (match: RegExpExecArray, ...rest: any[]): [NodeInterface[], boolean];
}
type ConstructKind = [ConstructCallback, RegExp]
type ConstructsKind = ConstructKind[]

export interface Explicit {
    patterns: Patterns;
    constructs: ConstructsKind;
}

export interface RstStateMachineRunArgs extends StateMachineRunArgs {
    memo?: RstMemo;
}
export interface CommonParseArgs {
    inputLines?: StringList;
    inputOffset?: number;
    node?: NodeInterface;
    matchTitles?: boolean;
}

export interface RSTStateArgs {
    stateClasses?: string[];
    debug?: boolean;
}

export interface RSTParseArgs extends CommonParseArgs {
    inliner: Inliner;
    document: Document;
}

export interface NestedParseArgs extends CommonParseArgs {
    createStateMachine?: StateMachineFactoryFunction<Rststatemachine>;
    stateMachineArgs?: StateMachineConstructorArgs;
    initialState: string;
    blankFinish?: boolean;
    blankFinishState?: string;
    extraSettings?: { [settingName: string]: string|{} };
}

export interface RstMemo {
    document: Document;
    reporter: ReporterInterface;
    language?: RSTLanguage;
    titleStyles: (string[] | string)[];
    sectionLevel: number;
    sectionBubbleUpKludge: boolean;
    inliner: InlinerInterface;
}


export class DirectiveError extends Error {
    public constructor(readonly level: LogLevel, readonly message: any) {
        super(message);
    }

}

export interface DirectiveInterface {
    debug(message: any): DirectiveError;
    info(message: any): DirectiveError;
    warning(message: any): DirectiveError;
    error(message: any): DirectiveError;
    severe(message: any): DirectiveError;
}
export interface DirectivesInterface {
    [directiveName: string]: any;
};

export interface DirectiveOptions {
    [optionName: string]: any;
}

export interface RSTLanguage {
    directives: DirectivesInterface;
}
export interface InlinerInterface {
    initCustomizations(settings: Settings): void;

    parse(text: string, args: { lineno: number; memo: any; parent: ElementInterface }): any[][];

    adjustUri(uri: string): string;
}

export interface NestedStateMachineRunArgs extends StateMachineRunArgs {
    memo: RstMemo;
}

export interface StatemachineConstructor<T> {
    new (args: StateMachineConstructorArgs): T;
}

export interface Rststatemachine extends Statemachine {
    run(
        inputLines: StringList|string|string[],
        inputOffset?: number,
        runContext?: ContextKind,
        inputSource?: {},
        initialState?: string,
        document?: Document,
        matchTitles?: boolean,
        inliner?: InlinerInterface, ...rest: any[]): (string|{})[];
}

export interface Nestedstatemachine extends Statemachine {
    run(inputLines: StringList | string | string[],
        inputOffset: number,
        runContext?: ContextKind,
        inputSource?: {},
        initialState?: string,
        node?: NodeInterface,
        matchTitles?: boolean,
        memo?: RstMemo, ...rest: any[]): (string | {})[];
}
