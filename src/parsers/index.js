import Parser from '../Parser';
import * as rst from './restructuredtext';

function getParserClass(parserName) {
    if (parserName === 'restructuredtext') {
        return rst;
    }
    throw new Error('');
//    return require(`./${parserName}.js`).default;
}

export default {
    getParserClass,
    Parser,
};
