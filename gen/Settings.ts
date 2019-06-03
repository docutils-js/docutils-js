export interface StandaloneReader {
    /** standaloneReader: Disable the promotion of a lone top-level section title to document title (and subsequent section title to document subtitle promotion; enabled by default). */
    doctitleXform: boolean;
    /** standaloneReader: Disable the bibliographic field list transform (enabled by default). */
    docinfoXform: boolean;
    /** standaloneReader: Deactivate the promotion of lone subsection titles. */
    sectsubtitleXform: any;
}

export interface XmlWriter {
    /** xmlWriter: Generate XML with newlines before and after tags. */
    newlines: boolean;
    /** xmlWriter: Generate XML with indents and newlines. */
    indents: boolean;
    /** xmlWriter: Omit the XML declaration.  Use with caution. */
    xmlDeclaration: boolean;
    /** xmlWriter: Omit the DOCTYPE declaration. */
    doctypeDeclaration: boolean;
}

export interface RstParser {
    /** rstParser: Recognize and link to standalone PEP references (like "PEP 258"). */
    pepReferences: boolean;
    /** rstParser: Base URL for PEP references (default "http://www.python.org/dev/peps/"). */
    pepBaseUrl: any;
    /** rstParser: Template for PEP file part of URL. (default "pep-%04d") */
    pepFileUrlTemplate: any;
    /** rstParser: Recognize and link to standalone RFC references (like "RFC 822"). */
    rfcReferences: boolean;
    /** rstParser: Base URL for RFC references (default "http://tools.ietf.org/html/"). */
    rfcBaseUrl: any;
    /** rstParser: Set number of spaces for tab expansion (default 8). */
    tabWidth: any;
    /** rstParser: Leave spaces before footnote references. */
    trimFootnoteReferenceSpace: any;
    /** rstParser: Enable directives that insert the contents of external file ("include" & "raw").  Enabled by default. */
    fileInsertionEnabled: any;
    /** rstParser: Enable the "raw" directive.  Enabled by default. */
    rawEnabled: any;
    /** rstParser: Token name set for parsing code with Pygments: one of "long", "short", or "none (no parsing)". Default is "long". */
    syntaxHighlight: any;
    /** rstParser: Change straight quotation marks to typographic form: one of "yes", "no", "alt[ernative]" (default "no"). */
    smartQuotes: any;
    /** rstParser: Characters to use as "smart quotes" for <language>.  */
    smartquotesLocales: any;
    /** rstParser: Inline markup recognized anywhere, regardless of surrounding characters. Backslash-escapes must be used to avoid unwanted markup recognition. Useful for East Asian languages. Experimental. */
    characterLevelInlineMarkup: any;
}

export interface Frontend {
    /** frontend: Specify the document title as metadata. */
    title: any;
    /** frontend: Do not include a generator credit. */
    generator: any;
    /** frontend: Do not include a datestamp of any kind. */
    datestamp: any;
    /** frontend: Include a "View document source" link. */
    sourceLink: boolean;
    /** frontend: Use <URL> for a source link; implies --source-link. */
    sourceUrl: any;
    /** frontend: Do not include a "View document source" link. */
    noSourceLink: any;
    /** frontend: Disable backlinks to the table of contents. */
    tocBacklinks: any;
    /** frontend: Disable backlinks from footnotes and citations. */
    footnoteBacklinks: any;
    /** frontend: Disable section numbering by Docutils. */
    sectnumXform: any;
    /** frontend: Leave comment elements in the document tree. (default) */
    stripComments: any;
    /** frontend: Remove all elements with classes="<class>" from the document tree. Warning: potentially dangerous; use with caution. (Multiple-use option.) */
    stripElementsWithClasses: any;
    /** frontend: Remove all classes="<class>" attributes from elements in the document tree. Warning: potentially dangerous; use with caution. (Multiple-use option.) */
    stripClasses: any;
    /** frontend: Report no system messages.  (Same as "--report=5".) */
    reportLevel: any;
    /** frontend: Halt at the slightest problem.  Same as "--halt=info". */
    haltLevel: any;
    /** frontend: Enable a non-zero exit status for non-halting system messages at or above <level>.  Default: 5 (disabled). */
    exitStatusLevel: any;
    /** frontend: Disable debug output.  (default) */
    debug: any;
    /** frontend: Send the output of system messages to <file>. */
    warningStream: any;
    /** frontend: Disable Python tracebacks.  (default) */
    traceback: any;
    /** frontend: Specify the encoding and optionally the error handler of input text.  Default: <locale-dependent>:strict. */
    inputEncoding: any;
    /** frontend: Specify the error handler for undecodable characters.  Choices: "strict" (default), "ignore", and "replace". */
    inputEncodingErrorHandler: any;
    /** frontend: Specify the text encoding and optionally the error handler for output.  Default: UTF-8:strict. */
    outputEncoding: any;
    /** frontend: Specify error handler for unencodable output characters; "strict" (default), "ignore", "replace", "xmlcharrefreplace", "backslashreplace". */
    outputEncodingErrorHandler: any;
    /** frontend: Specify text encoding and error handler for error output.  Default text encoding: system encoding. Default error handler: backslashreplace. */
    errorEncoding: any;
    /** frontend: Specify the error handler for unencodable characters in error output.  Default: backslashreplace. */
    errorEncodingErrorHandler: any;
    /** frontend: Specify the language (as BCP 47 language tag).  Default: en. */
    languageCode: any;
    /** frontend: Write output file dependencies to <file>. */
    recordDependencies: any;
    /** frontend: Read configuration settings from <file>, if it exists. */
    config: any;
    /** frontend: Show this program's version number and exit. */
    version: any;
    /** frontend: Show this help message and exit. */
    help: any;
    /** frontend: SUPPRESSHELP */
    idPrefix: any;
    /** frontend: SUPPRESSHELP */
    autoIdPrefix: any;
    /** frontend: SUPPRESSHELP */
    dumpSettings: any;
    /** frontend: SUPPRESSHELP */
    dumpInternals: any;
    /** frontend: SUPPRESSHELP */
    dumpTransforms: any;
    /** frontend: SUPPRESSHELP */
    dumpPseudoXml: any;
    /** frontend: SUPPRESSHELP */
    exposeInternals: any;
    /** frontend: SUPPRESSHELP */
    strictVisitor: any;
}

export interface HTML4CSS1 {
    /** html4css1: Specify the template file (UTF-8 encoded).  Default is "/usr/share/docutils/writers/html4css1/template.txt". */
    template: any;
    /** html4css1: Comma separated list of stylesheet URLs. Overrides previous --stylesheet and --stylesheet-path settings. */
    stylesheet: any;
    /** html4css1: Comma separated list of stylesheet paths. Relative paths are expanded if a matching file is found in the --stylesheet-dirs. With --link-stylesheet, the path is rewritten relative to the output HTML file. Default: "html4css1.css" */
    stylesheetPath: any;
    /** html4css1: Link to the stylesheet(s) in the output HTML file. Default: embed stylesheets. */
    embedStylesheet: any;
    /** html4css1: Comma-separated list of directories where stylesheets are found. Used by --stylesheet-path when expanding relative path arguments. Default: "['.', '/usr/share/docutils/writers/html4css1', '/usr/share/docutils/writers/html5_polyglot']" */
    stylesheetDirs: any;
    /** html4css1: Specify the initial header level.  Default is 1 for "<h1>".  Does not affect document title & subtitle (see --no-doc-title). */
    initialHeaderLevel: any;
    /** html4css1: Specify the maximum width (in characters) for one-column field names.  Longer field names will span an entire row of the table used to render the field list.  Default is 14 characters.  Use 0 for "no limit". */
    fieldNameLimit: any;
    /** html4css1: Specify the maximum width (in characters) for options in option lists.  Longer options will span an entire row of the table used to render the option list.  Default is 14 characters.  Use 0 for "no limit". */
    optionLimit: any;
    /** html4css1: Format for footnote references: one of "superscript" or "brackets".  Default is "brackets". */
    footnoteReferences: any;
    /** html4css1: Format for block quote attributions: one of "dash" (em-dash prefix), "parentheses"/"parens", or "none".  Default is "dash". */
    attribution: any;
    /** html4css1: Disable compact simple bullet and enumerated lists. */
    compactLists: any;
    /** html4css1: Disable compact simple field lists. */
    compactFieldLists: any;
    /** html4css1: Added to standard table classes. Defined styles: "borderless". Default: "" */
    tableStyle: any;
    /** html4css1: Math output format, one of "MathML", "HTML", "MathJax" or "LaTeX". Default: "HTML math.css" */
    mathOutput: any;
    /** html4css1: Omit the XML declaration.  Use with caution. */
    xmlDeclaration: boolean;
    /** html4css1: Obfuscate email addresses to confuse harvesters while still keeping email links usable with standards-compliant browsers. */
    cloakEmailAddresses: boolean;
}

export interface Settings extends Frontend, HTML4CSS1, XmlWriter, StandaloneReader {
}
