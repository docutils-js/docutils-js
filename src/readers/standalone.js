import BaseReader from '../Reader';
import * as frontend from '../FrontEnd';
import * as references from '../transforms/references';


/* Ported from code written by David Goodger <goodger@python.org>
   by Kay McCormick <kay@kaymccormick.com>.

   Copyright: This file licensed under the MIT license.

   Standalone file Reader for the reStructuredText markup syntax.
*/

export const __docformat__ = 'reStructuredText';
export default class Reader extends BaseReader {
    constructor(...args) {
        super(...args);

        // """Contexts this reader supports."""
        this.supported = ['standalone'];

        // """A single document tree."""
        this.document = undefined;

        this.settingsSpec = [
        'Standalone Reader',
        null,
        [['Disable the promotion of a lone top-level section title to '
          + 'document title [and subsequent section title to document '
          + 'subtitle promotion; enabled by default].',
          ['--no-doc-title'],
          {
dest: 'doctitle_xform',
action: 'store_false',
default: 1,
           validator: frontend.validate_boolean,
}],
         ['Disable the bibliographic field list transform [enabled by '
          + 'default].',
          ['--no-doc-info'],
          {
dest: 'docinfo_xform',
action: 'store_false',
default: 1,
           validator: frontend.validate_boolean,
}],
         ['Activate the promotion of lone subsection titles to '
          + 'section subtitles [disabled by default].',
          ['--section-subtitles'],
          {
 dest: 'sectsubtitle_xform',
action: 'store_true',
default: 0,
           validator: frontend.validate_boolean,
}],
         ['Deactivate the promotion of lone subsection titles.',
          ['--no-section-subtitles'],
          { dest: 'sectsubtitle_xform', action: 'store_false' }],
        ]];

        this.configSection = 'standalone reader';
        this.configSectionDependencies = ['readers'];
    }

    getTransforms() {
        const r = [references.PropagateTargets];
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
