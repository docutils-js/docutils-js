// ========================================
import { NodeInterface } from "./types";
import xmlescape from "xml-escape";
import { Text } from "./nodes";

/**
 * convert a node to XML
 */
export function nodeToXml(node: NodeInterface): string {
    if (node instanceof Text) {
        const text = xmlescape(node.astext());
        return text;
    }
    if (node.hasChildren()) {
        return [node.starttag(), ...node.getChildren().map((c: NodeInterface): string => nodeToXml(c)), node.endtag()].join("");
    }
    return node.emptytag();
}
/**
 * Return a whitespace-normalized name.
 */
export function whitespaceNormalizeName(name: string): string {
    return name.replace(/\s+/, " ");
}

export function fullyNormalizeName(name: string): string {
    return name.toLowerCase().replace(/\s+/, " ");
}
