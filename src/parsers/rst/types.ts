import Inliner from "./Inliner";
import {
    Document,
    ElementInterface,
    LogLevel,
    NodeInterface,
    ReporterInterface,
    Statemachine,
    StateMachineConstructorArgs,
    StateMachineFactoryFunction,
    StateMachineRunArgs
} from "../../types";
import StringList from "../../StringList";
import { Settings } from "../../../gen/Settings";

export interface Explicit {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [patternName: string]: any;
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
    createStateMachine?: StateMachineFactoryFunction<Rststatemachine>,
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
    run(args: RstStateMachineRunArgs): (string|{})[];
}
