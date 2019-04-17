import FieldList from './FieldList';

class ExtensionOptions extends FieldList {
    /* Parse field_list fields for extension options. */
    /* No nested parsing is done (including inline markup parsing). */

    parse_field_body(indented, offset, node) {
        // """Override `Body.parse_field_body` for simpler parsing."""
        const lines = [];
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
ExtensionOptions.constructor.stateName = 'ExtensionOptions';
export default ExtensionOptions;
