import * as nodes from '../nodes';
import * as utils from '../utils';
import Transform from '../Transform';
import TransformError from '../TransformError';

export class TitlePromoter extends Transform {
    promoteTitle(node) {
    }
    promoteSubtitle(node) {
    }
    candidateIndex(node) {
    }
}

export class DocTitle extends TitlePromoter {
    /* Not sure how to set default priority */
    //default_priority = 320
    setMetadata() {
    }
    apply() {
    }
}

export class SectionSubTitle extends TitlePromoter {
    // default_priority = 350
    apply() {
    }
}

export class DocInfo extends Transform {
    //    default_priority = 340
    biblioNodes = { author: nodes.author,
		    authors: nodes.authors,
		    organization: nodes.organization,
		    address: nodes.address,
		    'contact': nodes.contact,
		    'version': nodes.version,
		    'revision': nodes.revision,
		    'status': nodes.status,
		    'date': nodes.date,
		    'copyright': nodes.copyright,
		    'dedication': nodes.topic,
		    'abstract': nodes.topic };

    apply() {
    }

    extractBibliographic(fieldList) {
    }

    checkEmptyBiblioField(field, name) {
    }
    checkCompoundBiblioField(field, name) {
    }

    rcsKeywordSubstitutions = [] // todo fixme
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


