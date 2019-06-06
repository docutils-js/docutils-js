import BaseReader from '../Reader';
//import * as frontend from '../FrontEnd';
import * as references from '../transforms/references';
import * as frontmatter from '../transforms/frontmatter';


/* Ported from code written by David Goodger <goodger@python.org>
   by Kay McCormick <kay@kaymccormick.com>.

   Copyright: This file licensed under the MIT license.

   Standalone file Reader for the reStructuredText markup syntax.
*/

export const __docformat__ = 'reStructuredText';
export default class Reader extends BaseReader {
    constructor(args) {
        super(args);

        /** Contexts this reader supports. */
        this.supported = ['standalone'];

        /** A single document tree. */
        this.document = undefined;

        this.configSection = 'standalone reader';
        this.configSectionDependencies = ['readers'];
    }

    getTransforms() {
        const s = super.getTransforms();
        const r = [...s, references.PropagateTargets,
                   frontmatter.DocTitle,
                   frontmatter.SectionSubTitle,
                   frontmatter.DocInfo];
        return r;
    }
    /*
        return readers.Reader.get_transforms(self) + [
            references.Substitutions,
            references.PropagateTargets,
            frontmatter.DocTitle,
            frontmatter.SectionSubTitle,
            frontmatter.DocInfo,
            references.AnonymousHyperlinks,
            references.IndirectHyperlinks,
            references.Footnotes,
            references.ExternalTargets,
            references.InternalTargets,
            references.DanglingReferences,
            misc.Transitions,
            ]
*/
}
