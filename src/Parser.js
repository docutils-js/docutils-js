import Component from './Component'
import { UnimplementedException } from './Exceptions';

class Parser extends Component {
    constructor(args) {
	super(args);
	this.componentType = 'parser';
	this.configSection = 'parsers'
    }
    
    parse(inputstring, document) {
	throw new UnimplementedException("subclass implement parse");
    }
    setupParse(inputstring, document) {
    }
    finishParse() {
    }
}

export default Parser;
