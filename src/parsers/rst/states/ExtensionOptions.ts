import FieldList from './FieldList';
import * as nodes from '../../../nodes';
import {NodeInterface} from "../../../types";

class ExtensionOptions extends FieldList {
    /* Parse field_list fields for extension options. */
    /* No nested parsing is done (including inline markup parsing). */

    /** Override `Body.parse_field_body` for simpler parsing. */
    /* eslint-disable-next-line @typescript-eslint/camelcase,camelcase */
    public parse_field_body(indented: string[], offset: number, node: NodeInterface) {
        const lines = [];
        /* eslint-disable-next-line no-restricted-syntax */
        for (const line of [...indented, '']) {
            if (line.trim()) {
                lines.push(line);
            } else if (lines.length) {
                const text = lines.join('\n');
                node.add(new nodes.paragraph(text, text));
                lines.length = 0;
            }
        }
    }
}

ExtensionOptions.stateName = 'ExtensionOptions';
//ExtensionOptions//.constructor.stateName = 'ExtensionOptions';
export default ExtensionOptions;
