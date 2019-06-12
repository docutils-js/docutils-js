/*** Mapping of node class name to label text. */
export const labels: any = {
    // fixed: language-dependent
    'author': 'Author',
    'authors': 'Authors',
    'organization': 'Organization',
    'address': 'Address',
    'contact': 'Contact',
    'version': 'Version',
    'revision': 'Revision',
    'status': 'Status',
    'date': 'Date',
    'copyright': 'Copyright',
    'dedication': 'Dedication',
    'abstract': 'Abstract',
    'attention': 'Attention!',
    'caution': 'Caution!',
    'danger': '!DANGER!',
    'error': 'Error',
    'hint': 'Hint',
    'important': 'Important',
    'note': 'Note',
    'tip': 'Tip',
    'warning': 'Warning',
    'contents': 'Contents'
}

/** English (lowcased) to canonical name mapping for bibliographic fields. */
export const bibliographicFields: any = {
    // language-dependent: fixed
    'author': 'author',
    'authors': 'authors',
    'organization': 'organization',
    'address': 'address',
    'contact': 'contact',
    'version': 'version',
    'revision': 'revision',
    'status': 'status',
    'date': 'date',
    'copyright': 'copyright',
    'dedication': 'dedication',
    'abstract': 'abstract',
}


/** List of separator strings for the 'Authors' bibliographic field. Tried in order. */
export const authorSeparators: string[] = [';', ','];

