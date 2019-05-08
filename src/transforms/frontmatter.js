import * as nodes from '../nodes';
import * as utils from '../utils';
import Transform from '../Transform';
import TransformError from '../TransformError';

export class TitlePromoter extends Transform {
    promoteTitle(node) {
        if (!(node instanceof nodes.Element)) {
            throw new TypeError('node must be of Element-derived type.');
        }
        // assert not (len(node) and isinstance(node[0], nodes.title))
        const [section, index] = this.candidateIndex(node);
        if (index == null) {
            return undefined;
        }
        node.updateAllAttsConcatenating(section, true, true);
        const newChildren = [...section.children.slice(0, 1),
                             ...node.children.slice(0, index),
                             ...section.children.slice(1)];
        node.children = newChildren;
        // assert isinstance(node[0], nodes.title)
        return 1;
    }

    promoteSubtitle(node) {
        console.log('promoteSubtitle');
        // Type check
        const [subsection, index] = this.candidateIndex(node);
        if (index == null) {
            return undefined;
        }
        const subtitle = new nodes.subtitle();

        // Transfer the subsection's attributes to the new subtitle
        // NOTE: Change second parameter to False to NOT replace
        //       attributes that already exist in node with those in
        //       section
            // NOTE: Remove third parameter to NOT copy the 'source'
        //       attribute from section
        subtitle.updateAllAttsConcatenating(subsection, true, true);

        // Transfer the contents of the subsection's title to the
        // subtitle:
        subtitle.children = subsection.children[0].children.slice();
        node.children = [node.children[0], // title
         subtitle,
        // everything that was before the section:
            ...node.children.slice(1, index),
        // everything that was in the subsection:
             ...subsection.children.slice(1)];
        return 1;
    }

    candidateIndex(node) {
        const index = node.firstChildNotMatchingClass(nodes.PreBibliographic);
        if (index == null || node.children.length > (index + 1)
            || !(node.children[index] instanceof nodes.section)) {
            return [null, null];
        }
            return [node.children[index], index];
    }
}

export class DocTitle extends TitlePromoter {
    /* Not sure how to set default priority */
    _init(...args) {
        super._init(...args);
        this.defaultPriority = 320;
    }

    setMetadata() {
        if (!('title' in this.document.attributes)) {
            if (this.document.settings.title != null) {
                this.document.attributes.title = this.document.settings.title;
            } else if (this.document.length && this.document.children[0] instanceof nodes.title) {
                this.document.attributes.title = this.document.children[0].astext();
            }
        }
    }

    apply() {
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
    _init(...args) {
        super._init(...args);
        this.defaultPriority = 350;
    }

    apply() {
        if (this.document.settings.sectsubtitleXform || typeof this.document.settings.sectsubtitleXform === 'undefined') {
            this.document.traverse(nodes.section).forEach((section) => {
            // On our way through the node tree, we are deleting
            // sections, but we call self.promote_subtitle for those
            // sections nonetheless.  To do: Write a test case which
            // shows the problem and discuss on Docutils-develop.
                this.promoteSubtitle(section);
            });
        }
    }
}

SectionSubTitle.defaultPriority = 350;

export class DocInfo extends Transform {
    _init(...args) {
        super._init(...args);
        this.defaultPriority = 340;
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

    apply() {
    }

    extractBibliographic(fieldList) {
    }

    checkEmptyBiblioField(field, name) {
    }

    checkCompoundBiblioField(field, name) {
    }

    // rcsKeywordSubstitutions = [] // todo fixme
    /*    rcs_keyword_substitutions = [
          (re.compile(r'\$' r'Date: (\d\d\d\d)[-/](\d\d)[-/](\d\d)[ T][\d:]+'
                      r'[^$]* \$', re.IGNORECASE), r'\1-\2-\3'),
          (re.compile(r'\$' r'RCSfile: (.+),v \$', re.IGNORECASE), r'\1'),
          (re.compile(r'\$[a-zA-Z]+: (.+) \$'), r'\1'),]
    */
    extractAuthors(field, name, docinfo) {
    }

    authorsFromOneParagraph(field) {
    }

    authorsFromBulletList(field) {
    }

    authorsFromParagraphs(field) {
    }
}
DocInfo.defaultPriority = 340;
