import Directive from '../Directive';
import * as nodes from '../../../nodes';

export class Contents extends Directive {
    run() {
        return [new nodes.comment('', 'unimplemented directive contents')];
    }
}
export class Sectnum extends Directive {
}
