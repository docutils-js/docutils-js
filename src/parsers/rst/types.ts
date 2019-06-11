import Inliner from "./Inliner";
import { Document, INode, IReporter, StateMachineCommonArgs } from "../../types";
import StringList from "../../StringList";

export interface CommonParseArgs {
    inputLines?: StringList;
    inputOffset?: number;
    node?: INode;
    matchTitles?: boolean;
}

export interface RSTStateArgs {
    stateClasses?: string[];
    debug?: boolean;
}

export interface RSTParseArgs extends CommonParseArgs {
    inliner: Inliner,
    document: Document,
}

export interface NestedParseArgs extends CommonParseArgs, StateMachineClassArgs {
    initialState?: any;
    blankFinish?: boolean;
    blankFinishState?: string;
    extraSettings?: any;
}

interface StateMachineArgs extends StateMachineCommonArgs {
    initialState: string;
    stateFactory: any;
}

interface StateMachineClassArgs {
    stateMachineClass?: any;
    stateMachineKwargs?: StateMachineArgs;
}


export interface RstMemo {
    document: Document;
    reporter: IReporter,
    language: IRSTLanguage,
    titleStyles: (string[] | string)[]
    sectionLevel: number,
    sectionBubbleUpKludge: boolean,
    inliner: Inliner,
}


export interface IDirective {

}
export interface IDirectives {
[directiveName: string]: any
};

export interface IRSTLanguage {
    directives: IDirectives;
}
