import * as references from '../transforms/references';
import * as frontmatter from '../transforms/frontmatter';
import baseReaderTransforms from
'./baseReaderTransforms';

/* eslint-disable-next-line no-unused-vars */
const __docformat__ = 'reStructuredText';

const supported = ['standalone'];
const transforms = '';

this.document = undefined;

function getTransforms() {
    const s = baseReaderTransforms;
    const r = [...s, references.PropagateTargets,
               frontmatter.DocTitle,
               frontmatter.SectionSubTitle,
               frontmatter.DocInfo];
    return r;
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
export { supported, transforms, getTransforms };
