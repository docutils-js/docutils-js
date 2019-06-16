import Parser from '../Parser';
import RestructuredTextParser from './restructuredtext';
import { ParserConsructor } from "../types";

function getParserClass(parserName: string): ParserConsructor {
    if (parserName === 'restructuredtext') {
        return RestructuredTextParser;
    }
    throw new Error('');
//    return require(`./${parserName}.js`).default;
}

export default {
    getParserClass,
    Parser,
};
