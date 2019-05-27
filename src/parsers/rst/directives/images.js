import * as nodes from '../../../nodes';
import Directive from '../Directive';

const __docformat__ = 'reStructuredText';

class Image extends Directive {
    _init(...args) {
        super._init(...args);
        this.alignHValues = ['left', 'center', 'right'];
        this.alignVValues = ['top', 'middle', 'bottom'];
        this.aliasValues = [...this.alignHValues, ...this.alignVValues];
        this.requiredArgumetns = 1;
        this.optionalArguments = 1;
        this.finalArgumentWhitespace = true;
        this.optionSpec = {'alt': directives.unchanged,
                           'height': directives.length_or_unitless,
                           'width': directives.length_or_percentage_or_unitless,
                           'scale': directives.percentage,
                           'align': align,
                           'name': directives.unchanged,
                           'target': directives.unchanged_required,
                           'class': directives.class_option};
    }

    align(argument) {
        return directives.chocie(argument);
    }
    
    run() {
        return new nodes.comment('', 'test', [], {});
    }
}

class Figure extends Image {
}

export { Image, Figure };
