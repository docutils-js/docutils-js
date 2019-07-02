import * as references from '../transforms/references';
import * as frontmatter from '../transforms/frontmatter';
import baseReaderTransforms from
    './baseReaderTransforms';
import { TransformType } from "../types";

/* eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars */
const __docformat__ = 'reStructuredText';

const supported = ['standalone'];
const transforms = '';


function getTransforms(): TransformType[] {
    const s = baseReaderTransforms;
    // @ts-ignore
    const r = [...s, references.PropagateTargets,
        frontmatter.DocTitle,
        frontmatter.SectionSubTitle,
        frontmatter.DocInfo];
    return r;
    /*
        return readers.StandaloneReader.get_transforms(self) + [
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
