import * as nodes from '../nodes';
/* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
import * as utils from '../utils';
import Transform from '../Transform';
/* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
import TransformError from '../error/TransformError';
import {Document, ElementInterface, NodeInterface} from "../types";

/**
 * TitlePromoter transform.
 * Base class for other transforms which promote section names to title and subtitle
 */
abstract class TitlePromoter extends Transform {
    public promoteTitle(node: NodeInterface) {
        if (!(node instanceof nodes.Element)) {
            throw new TypeError('node must be of Element-derived type.');
        }
        // assert not (len(node) and isinstance(node[0], nodes.title))
        const [section, index] = this.candidateIndex(node);
        if (index == null) {
            return undefined;
        }
        node.updateAllAttsConcatenating(section, true, true);
        // @ts-ignore
        const newChildren = [...section.children.slice(0, 1),
            // @ts-ignore

            ...node.children.slice(0, index),
            // @ts-ignore
            ...section.children.slice(1)];
        node.clearChildren();
        node.add(newChildren);
        // assert isinstance(node[0], nodes.title)
        return 1;
    }

    public promoteSubtitle(node: ElementInterface) {
        // console.log('promoteSubtitle');
        // Type check
        const x = this.candidateIndex(node);
        const subsection: ElementInterface = x[0];
        const index: number = x[1];
        if (index == null) {
            return undefined;
        }
        const subtitle: ElementInterface = new nodes.subtitle();

        // Transfer the subsection's attributes to the new subtitle
        // NOTE: Change second parameter to False to NOT replace
        //       attributes that already exist in node with those in
        //       section
        // NOTE: Remove third parameter to NOT copy the 'source'
        //       attribute from section
        subtitle.updateAllAttsConcatenating(subsection, true, true);

        // Transfer the contents of the subsection's title to the
        // subtitle:
        subtitle.add(subsection!.getChild(0).getChildren());
        node.add([node.getChild(0), // title
            subtitle,
            // everything that was before the section:
            ...node.getChildren().slice(1, index),
            // everything that was in the subsection:
            ...subsection.getChildren().slice(1)]);
        return 1;
    }

    public candidateIndex(node: ElementInterface): any[] {
        const index = node.firstChildNotMatchingClass(nodes.PreBibliographic);
        if (index == null || node.getNumChildren() > (index + 1)
            || !(node.getChild(index) instanceof nodes.section)) {
            return [null, null];
        }
        return [node.getChild(index), index];
    }
}

export class DocTitle extends TitlePromoter {

    public setMetadata() {
        if (!('title' in this.document.attributes)) {
            let title = this.document.settings.title;
            if (title != null) {
                this.document.attributes.title = title;
            } else if (this.document.hasChildren() && this.document.getChild(0) instanceof nodes.title) {
                this.document.attributes.title = this.document.getChild(0).astext();
            }
        }
    }

    public apply() {
        if (this.document.settings.doctitleXform || typeof this.document.settings.doctitleXform === 'undefined') {
            if (this.promoteTitle(this.document)) {
                this.promoteSubtitle(this.document);
            }
        }
        this.setMetadata();
    }
}
DocTitle.defaultPriority = 320;

export class SectionSubTitle extends TitlePromoter {

    public apply() {
        let reader = this.document.settings;
        if (!reader || (reader.sectsubtitleXform || typeof reader.sectsubtitleXform === 'undefined')) {
            this.document.traverse({ condition: nodes.section }).forEach((section) => {
            // On our way through the node tree, we are deleting
            // sections, but we call self.promote_subtitle for those
            // sections nonetheless.  To do: Write a test case which
            // shows the problem and discuss on Docutils-develop.
                this.promoteSubtitle(section as ElementInterface);
            });
        }
    }
}

SectionSubTitle.defaultPriority = 350;

export class DocInfo extends Transform {
    private biblioNodes: any;

    public _init(document: Document, startNode: NodeInterface | undefined) {
        super._init(document, startNode);

        this.biblioNodes = {
            author: nodes.author,
            authors: nodes.authors,
            organization: nodes.organization,
            address: nodes.address,
            contact: nodes.contact,
            version: nodes.version,
            revision: nodes.revision,
            status: nodes.status,
            date: nodes.date,
            copyright: nodes.copyright,
            dedication: nodes.topic,
            abstract: nodes.topic,
        };
    }

    public apply() {
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
    // @ts-ignore
    public extractBibliographic(fieldList) {
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
    // @ts-ignore
    public checkEmptyBiblioField(field, name) {
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
    // @ts-ignore
    public checkCompoundBiblioField(field, name) {
    }

    // rcsKeywordSubstitutions = [] // todo fixme
    /*    rcs_keyword_substitutions = [
          (re.compile(r'\$' r'Date: (\d\d\d\d)[-/](\d\d)[-/](\d\d)[ T][\d:]+'
                      r'[^$]* \$', re.IGNORECASE), r'\1-\2-\3'),
          (re.compile(r'\$' r'RCSfile: (.+),v \$', re.IGNORECASE), r'\1'),
          (re.compile(r'\$[a-zA-Z]+: (.+) \$'), r'\1'),]
    */
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
    // @ts-ignore
    public extractAuthors(field, name, docinfo) {
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
    // @ts-ignore
    public authorsFromOneParagraph(field) {
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
    // @ts-ignore
    public authorsFromBulletList(field) {
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public authorsFromParagraphs(field): void {
    }
}
DocInfo.defaultPriority = 340;

export { TitlePromoter };
