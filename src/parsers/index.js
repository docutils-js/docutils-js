import { Parser} from '../Parser';

function getParserClass(parserName) {
    return require(`./${parserName}.js`).default;
}

export default{
    getParserClass,
    Parser,
}

