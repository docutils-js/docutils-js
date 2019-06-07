import * as nodes from '../../../nodes';
import Directive from '../Directive';
import {INode} from "../../../types";

/* eslint-disable-next-line no-unused-vars */
const __docformat__ = 'reStructuredText';

const directives = {};

class Image extends Directive {
    private finalArgumentWhitespace?: boolean;
    private alignHValues?: string[];
    private alignVValues?: string[];
    private requiredArguments?: number;
    private optionalArguments?: number;
    private alignValues?: string[];
    _init() {
        super._init();
        this.alignHValues = ['left', 'center', 'right'];
        this.alignVValues = ['top', 'middle', 'bottom'];
        this.alignValues = [...this.alignHValues, ...this.alignVValues];
        this.requiredArguments = 1;
        this.optionalArguments = 1;
        this.finalArgumentWhitespace = true;
        // @ts-ignore
        this.optionSpec = {
        // @ts-ignore
 alt: directives.unchanged,
        // @ts-ignore
                           height: directives.length_or_unitless,
        // @ts-ignore
                           width: directives.length_or_percentage_or_unitless,
        // @ts-ignore
                           scale: directives.percentage,
        // @ts-ignore
            align: this.align,
        // @ts-ignore
                           name: directives.unchanged,
        // @ts-ignore
                           target: directives.unchanged_required,
        // @ts-ignore
                           class: directives.class_option,
        // @ts-ignore
};
    }

    align(argument: any): any | any[] {
        // @ts-ignore
        return directives.choice(argument);
    }

    run(): INode {
        return new nodes.comment('', 'test', [], {});
    }
}

class Figure extends Image {
}

export { Image, Figure };
