import Parser from '../Parser';
import RestructuredTextParser from './restructuredtext';

function getParserClass(parserName) {
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
