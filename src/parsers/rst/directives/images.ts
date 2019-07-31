import * as nodes from '../../../nodes';
import Directive from '../Directive';
import {NodeInterface,Statemachine,Options} from "../../../types";
import { lengthOrPercentageOrUnitless, lengthOrUnitless, unchanged } from "../directiveConversions";
import SubstitutionDef from "../states/SubstitutionDef";
import { escape2null } from "../../../utils";
import Body from "../states/Body";
import StringList from "../../../StringList";
import { setClasses } from "../Roles";
import { uri } from "../directives";
import { fullyNormalizeName, whitespaceNormalizeName } from "../../../nodeUtils";

/* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
const __docformat__ = 'reStructuredText';

const directives = {};

class Image extends Directive {
    private finalArgumentWhitespace?: boolean;
    private alignHValues: string[] = ['left', 'center', 'right'];
    private alignVValues: string[] = ['top', 'middle', 'bottom'];
    ;

    private alignValues: string[] = [...this.alignHValues, ...this.alignVValues];
    /*    public constructor(args: { name: string; args: string[]; options: Options; content: any; lineno: number; contentOffset: number; blockText: StringList; state: Body; stateMachine: Statemachine }) {
        super(args);
    }
*/
    public align(argument: {}): {} | {}[] {
    // @ts-ignore
        return directives.choice(argument);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private addName(imageNode: NodeInterface) {

    }

    run(): any[] {
        if(!this.arguments) {
            throw new Error('');
        }
        if (this.options && 'align' in this.options) {
            if (this.state instanceof SubstitutionDef) {
                // Check for align_v_values.
                if (this.alignVValues.indexOf(this.options.align) == -1) {
                    throw this.error(
                        `Error in "${this.name}" directive: "${this.options.align}" is not a valid value '
                        'for the "align" option within a substitution '
                        'definition.  Valid values for "align" are: "${this.alignVValues.join('", "')}".`);
                }
            } else if (this.alignHValues.indexOf(this.options.align) === -1) {
                throw this.error(`Error in "${this.name}" directive: "${this.options.align}" is ` +
          `not a valid value for the "align" option.  Valid values for "align" are: "${this.alignHValues.join('", "')}".`);
            }
        }

        const messages = [];
        const reference = uri(this.arguments[0])
        this.options.uri = reference
        let referenceNode = null
        if ('target' in this.options) {
            let blockStr: string = escape2null(this.options.target
                .split(/\n/));
            let block = blockStr.split(/\n/);
            const [targetType, data] = this.state.parse_target(
                new StringList(block), this.blockText, this.lineno);
            let referenceNode;
            if (targetType === 'refuri') {
                referenceNode = new nodes.reference('', '', [], { refuri: data });
            } else if (targetType === 'refname') {
                referenceNode = new nodes.reference('', '', [], {
                    refname: fullyNormalizeName(data),
                    name: whitespaceNormalizeName(data)
                });
                referenceNode.indirectReferenceName = data
                this.state.document!.noteRefname(referenceNode)
            } else {                           // malformed target
                messages.push(data)       // data is a system message
            }
            delete this.options.target;
            setClasses(this.options)
            const imageNode = new nodes.image(this.blockText, [], this.options);
            this.addName(imageNode)
            if (referenceNode) {
                referenceNode.append(imageNode);

                return [...messages, referenceNode];
            } else {
                return [...messages, imageNode];
            }
        }
        return [];
    }
}
Image.optionSpec = {
    alt: unchanged,
    height: lengthOrUnitless,
    width: lengthOrPercentageOrUnitless,
    // @ts-ignore
    scale: directives.percentage,
    // @ts-ignore
    align: Image.align,
    // @ts-ignore
    name: unchanged,
    // @ts-ignore
    target: directives.unchanged_required,
    // @ts-ignore
    class: directives.class_option,
};
class Figure extends Image {
}

export { Image, Figure };
