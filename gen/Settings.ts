export interface DocutilsCoreOptionParser {
    /** DocutilsCoreOptionParser: Specify the document title as metadata. */
    title?: string;
    /** DocutilsCoreOptionParser: Do not include a generator credit. */
    generator?: string;
    /** DocutilsCoreOptionParser: Do not include a datestamp of any kind. */
    datestamp?: string;
    /** DocutilsCoreOptionParser: Include a "View document source" link. */
    sourceLink?: boolean;
    /** DocutilsCoreOptionParser: Use <URL> for a source link; implies --source-link. */
    sourceUrl?: string;
    /** DocutilsCoreOptionParser: Do not include a "View document source" link. */
    noSourceLink?: string;
    /** DocutilsCoreOptionParser: Disable backlinks to the table of contents. */
    tocBacklinks?: string;
    /** DocutilsCoreOptionParser: Disable backlinks from footnotes and citations. */
    footnoteBacklinks?: boolean;
    /** DocutilsCoreOptionParser: Disable section numbering by Docutils. */
    sectnumXform?: number;
    /** DocutilsCoreOptionParser: Leave comment elements in the document tree. (default) */
    stripComments?: string;
    /** DocutilsCoreOptionParser: Remove all elements with classes="<class>" from the document tree. Warning: potentially dangerous; use with caution. (Multiple-use option.) */
    stripElementsWithClasses?: string;
    /** DocutilsCoreOptionParser: Remove all classes="<class>" attributes from elements in the document tree. Warning: potentially dangerous; use with caution. (Multiple-use option.) */
    stripClasses?: string;
    /** DocutilsCoreOptionParser: Report no system messages.  (Same as "--report=5".) */
    reportLevel?: number;
    /** DocutilsCoreOptionParser: Halt at the slightest problem.  Same as "--halt=info". */
    haltLevel?: number;
    /** DocutilsCoreOptionParser: Enable a non-zero exit status for non-halting system messages at or above <level>.  Default: 5 (disabled). */
    exitStatusLevel?: number   ;
    /** DocutilsCoreOptionParser: Disable debug output.  (default) */
    debug?: boolean;
    /** DocutilsCoreOptionParser: Send the output of system messages to <file>. */
    warningStream?: string|null;
    /** DocutilsCoreOptionParser: Disable Python tracebacks.  (default) */
    traceback?: boolean|null;
    /** DocutilsCoreOptionParser: Specify the encoding and optionally the error handler of input text.  Default: <locale-dependent>:strict. */
    inputEncoding?: string;
    /** DocutilsCoreOptionParser: Specify the error handler for undecodable characters.  Choices: "strict" (default), "ignore", and "replace". */
    inputEncodingErrorHandler?: string;
    /** DocutilsCoreOptionParser: Specify the text encoding and optionally the error handler for output.  Default: UTF-8:strict. */
    outputEncoding?: string;
    /** DocutilsCoreOptionParser: Specify error handler for unencodable output characters; "strict" (default), "ignore", "replace", "xmlcharrefreplace", "backslashreplace". */
    outputEncodingErrorHandler?: string;
    /** DocutilsCoreOptionParser: Specify text encoding and error handler for error output.  Default text encoding: system encoding. Default error handler: backslashreplace. */
    errorEncoding?: string;
    /** DocutilsCoreOptionParser: Specify the error handler for unencodable characters in error output.  Default: backslashreplace. */
    errorEncodingErrorHandler?: string;
    /** DocutilsCoreOptionParser: Specify the language (as BCP 47 language tag).  Default: en. */
    languageCode?: string;
    /** DocutilsCoreOptionParser: Write output file dependencies to <file>. */
    recordDependencies?: string|null;
    /** DocutilsCoreOptionParser: Read configuration settings from <file>, if it exists. */
    config?: string;
    /** DocutilsCoreOptionParser: Show this program's version number and exit. */
    version?: string;
    /** DocutilsCoreOptionParser: Show this help message and exit. */
    help?: string;
    /** DocutilsCoreOptionParser: SUPPRESSHELP */
    idPrefix?: string;
    /** DocutilsCoreOptionParser: SUPPRESSHELP */
    autoIdPrefix?: string;
    /** DocutilsCoreOptionParser: SUPPRESSHELP */
    dumpSettings?: string|null;
    /** DocutilsCoreOptionParser: SUPPRESSHELP */
    dumpInternals?: string|null;
    /** DocutilsCoreOptionParser: SUPPRESSHELP */
    dumpTransforms?: string|null;
    /** DocutilsCoreOptionParser: SUPPRESSHELP */
    dumpPseudoXml?: string;
    /** DocutilsCoreOptionParser: SUPPRESSHELP */
    exposeInternals?: string;
    /** DocutilsCoreOptionParser: SUPPRESSHELP */
    strictVisitor?: boolean|null;
}

export interface DocutilsFrontendOptionParser {
    /** DocutilsFrontendOptionParser: Specify the document title as metadata. */
    title?: string;
    /** DocutilsFrontendOptionParser: Do not include a generator credit. */
    generator?: string;
    /** DocutilsFrontendOptionParser: Do not include a datestamp of any kind. */
    datestamp?: string;
    /** DocutilsFrontendOptionParser: Include a "View document source" link. */
    sourceLink?: boolean;
    /** DocutilsFrontendOptionParser: Use <URL> for a source link; implies --source-link. */
    sourceUrl?: string;
    /** DocutilsFrontendOptionParser: Do not include a "View document source" link. */
    noSourceLink?: string;
    /** DocutilsFrontendOptionParser: Disable backlinks to the table of contents. */
    tocBacklinks?: string;
    /** DocutilsFrontendOptionParser: Disable backlinks from footnotes and citations. */
    footnoteBacklinks?: boolean;
    /** DocutilsFrontendOptionParser: Disable section numbering by Docutils. */
    sectnumXform?: number;
    /** DocutilsFrontendOptionParser: Leave comment elements in the document tree. (default) */
    stripComments?: string;
    /** DocutilsFrontendOptionParser: Remove all elements with classes="<class>" from the document tree. Warning: potentially dangerous; use with caution. (Multiple-use option.) */
    stripElementsWithClasses?: string;
    /** DocutilsFrontendOptionParser: Remove all classes="<class>" attributes from elements in the document tree. Warning: potentially dangerous; use with caution. (Multiple-use option.) */
    stripClasses?: string;
    /** DocutilsFrontendOptionParser: Report no system messages.  (Same as "--report=5".) */
    reportLevel?: number;
    /** DocutilsFrontendOptionParser: Halt at the slightest problem.  Same as "--halt=info". */
    haltLevel?: number;
    /** DocutilsFrontendOptionParser: Enable a non-zero exit status for non-halting system messages at or above <level>.  Default: 5 (disabled). */
    exitStatusLevel?: number;
    /** DocutilsFrontendOptionParser: Disable debug output.  (default) */
    debug?: boolean;
    /** DocutilsFrontendOptionParser: Send the output of system messages to <file>. */
    warningStream?: string|null;
    /** DocutilsFrontendOptionParser: Disable Python tracebacks.  (default) */
    traceback?: boolean|null;
    /** DocutilsFrontendOptionParser: Specify the encoding and optionally the error handler of input text.  Default: <locale-dependent>:strict. */
    inputEncoding?: string;
    /** DocutilsFrontendOptionParser: Specify the error handler for undecodable characters.  Choices: "strict" (default), "ignore", and "replace". */
    inputEncodingErrorHandler?: string;
    /** DocutilsFrontendOptionParser: Specify the text encoding and optionally the error handler for output.  Default: UTF-8:strict. */
    outputEncoding?: string;
    /** DocutilsFrontendOptionParser: Specify error handler for unencodable output characters; "strict" (default), "ignore", "replace", "xmlcharrefreplace", "backslashreplace". */
    outputEncodingErrorHandler?: string;
    /** DocutilsFrontendOptionParser: Specify text encoding and error handler for error output.  Default text encoding: system encoding. Default error handler: backslashreplace. */
    errorEncoding?: string;
    /** DocutilsFrontendOptionParser: Specify the error handler for unencodable characters in error output.  Default: backslashreplace. */
    errorEncodingErrorHandler?: string;
    /** DocutilsFrontendOptionParser: Specify the language (as BCP 47 language tag).  Default: en. */
    languageCode?: string;
    /** DocutilsFrontendOptionParser: Write output file dependencies to <file>. */
    recordDependencies?: string|null;
    /** DocutilsFrontendOptionParser: Read configuration settings from <file>, if it exists. */
    config?: string;
    /** DocutilsFrontendOptionParser: Show this program's version number and exit. */
    version?: string;
    /** DocutilsFrontendOptionParser: Show this help message and exit. */
    help?: string;
    /** DocutilsFrontendOptionParser: SUPPRESSHELP */
    idPrefix?: string;
    /** DocutilsFrontendOptionParser: SUPPRESSHELP */
    autoIdPrefix?: string;
    /** DocutilsFrontendOptionParser: SUPPRESSHELP */
    dumpSettings?: string|null;
    /** DocutilsFrontendOptionParser: SUPPRESSHELP */
    dumpInternals?: string|null;
    /** DocutilsFrontendOptionParser: SUPPRESSHELP */
    dumpTransforms?: string|null;
    /** DocutilsFrontendOptionParser: SUPPRESSHELP */
    dumpPseudoXml?: string;
    /** DocutilsFrontendOptionParser: SUPPRESSHELP */
    exposeInternals?: string;
    /** DocutilsFrontendOptionParser: SUPPRESSHELP */
    strictVisitor?: boolean|null;
}

export interface DocutilsParsersRstParser {
    /** DocutilsParsersRstParser: Recognize and link to standalone PEP references (like "PEP 258"). */
    pepReferences?: boolean;
    /** DocutilsParsersRstParser: Base URL for PEP references (default "http://www.python.org/dev/peps/"). */
    pepBaseUrl?: string;
    /** DocutilsParsersRstParser: Template for PEP file part of URL. (default "pep-%04d") */
    pepFileUrlTemplate?: string;
    /** DocutilsParsersRstParser: Recognize and link to standalone RFC references (like "RFC 822"). */
    rfcReferences?: boolean;
    /** DocutilsParsersRstParser: Base URL for RFC references (default "http://tools.ietf.org/html/"). */
    rfcBaseUrl?: string;
    /** DocutilsParsersRstParser: Set number of spaces for tab expansion (default 8). */
    tabWidth?: number;
    /** DocutilsParsersRstParser: Leave spaces before footnote references. */
    trimFootnoteReferenceSpace?: string;
    /** DocutilsParsersRstParser: Enable directives that insert the contents of external file ("include" & "raw").  Enabled by default. */
    fileInsertionEnabled?: number;
    /** DocutilsParsersRstParser: Enable the "raw" directive.  Enabled by default. */
    rawEnabled?: number;
    /** DocutilsParsersRstParser: Token name set for parsing code with Pygments: one of "long", "short", or "none (no parsing)". Default is "long". */
    syntaxHighlight?: string;
    /** DocutilsParsersRstParser: Change straight quotation marks to typographic form: one of "yes", "no", "alt[ernative]" (default "no"). */
    smartQuotes?: boolean;
    /** DocutilsParsersRstParser: Characters to use as "smart quotes" for <language>.  */
    smartquotesLocales?: string;
    /** DocutilsParsersRstParser: Inline markup recognized anywhere, regardless of surrounding characters. Backslash-escapes must be used to avoid unwanted markup recognition. Useful for East Asian languages. Experimental. */
    characterLevelInlineMarkup?: boolean;
}

export interface DocutilsWritersDocutilsXmlWriter {
    /** DocutilsWritersDocutilsXmlWriter: Generate XML with newlines before and after tags. */
    newlines?: boolean;
    /** DocutilsWritersDocutilsXmlWriter: Generate XML with indents and newlines. */
    indents?: boolean;
    /** DocutilsWritersDocutilsXmlWriter: Omit the XML declaration.  Use with caution. */
    xmlDeclaration?: boolean;
    /** DocutilsWritersDocutilsXmlWriter: Omit the DOCTYPE declaration. */
    doctypeDeclaration?: boolean;
}

export interface DocutilsWritersPepHtmlWriter {
    /** DocutilsWritersPepHtmlWriter: Specify the template file (UTF-8 encoded).  Default is "/usr/share/docutils/writers/html4css1/template.txt". */
    template?: string;
    /** DocutilsWritersPepHtmlWriter: Comma separated list of stylesheet URLs. Overrides previous --stylesheet and --stylesheet-path settings. */
    stylesheet?: string;
    /** DocutilsWritersPepHtmlWriter: Comma separated list of stylesheet paths. Relative paths are expanded if a matching file is found in the --stylesheet-dirs. With --link-stylesheet, the path is rewritten relative to the output HTML file. Default: "html4css1.css" */
    stylesheetPath?: string[];
    /** DocutilsWritersPepHtmlWriter: Link to the stylesheet(s) in the output HTML file. Default: embed stylesheets. */
    embedStylesheet?: number;
    /** DocutilsWritersPepHtmlWriter: Comma-separated list of directories where stylesheets are found. Used by --stylesheet-path when expanding relative path arguments. Default: "['.', '/usr/share/docutils/writers/html4css1', '/usr/share/docutils/writers/html5_polyglot']" */
    stylesheetDirs?: string[];
    /** DocutilsWritersPepHtmlWriter: Specify the initial header level.  Default is 1 for "<h1>".  Does not affect document title & subtitle (see --no-doc-title). */
    initialHeaderLevel?: number;
    /** DocutilsWritersPepHtmlWriter: Specify the maximum width (in characters) for one-column field names.  Longer field names will span an entire row of the table used to render the field list.  Default is 14 characters.  Use 0 for "no limit". */
    fieldNameLimit?: number;
    /** DocutilsWritersPepHtmlWriter: Specify the maximum width (in characters) for options in option lists.  Longer options will span an entire row of the table used to render the option list.  Default is 14 characters.  Use 0 for "no limit". */
    optionLimit?: number;
    /** DocutilsWritersPepHtmlWriter: Format for footnote references: one of "superscript" or "brackets".  Default is "brackets". */
    footnoteReferences?: string;
    /** DocutilsWritersPepHtmlWriter: Format for block quote attributions: one of "dash" (em-dash prefix), "parentheses"/"parens", or "none".  Default is "dash". */
    attribution?: string;
    /** DocutilsWritersPepHtmlWriter: Disable compact simple bullet and enumerated lists. */
    compactLists?: number;
    /** DocutilsWritersPepHtmlWriter: Disable compact simple field lists. */
    compactFieldLists?: number;
    /** DocutilsWritersPepHtmlWriter: Added to standard table classes. Defined styles: "borderless". Default: "" */
    tableStyle?: string[]|string;
    /** DocutilsWritersPepHtmlWriter: Math output format, one of "MathML", "HTML", "MathJax" or "LaTeX". Default: "HTML math.css" */
    mathOutput?: string;
    /** DocutilsWritersPepHtmlWriter: Omit the XML declaration.  Use with caution. */
    xmlDeclaration?: boolean;
    /** DocutilsWritersPepHtmlWriter: Obfuscate email addresses to confuse harvesters while still keeping email links usable with standards-compliant browsers. */
    cloakEmailAddresses?: boolean;
}

export interface DocutilsWritersLatex2EWriter {
    /** DocutilsWritersLatex2EWriter: Specify documentclass.  Default is "article". */
    documentclass?: string;
    /** DocutilsWritersLatex2EWriter: Specify document options.  Multiple options can be given, separated by commas.  Default is "a4paper". */
    documentoptions?: string;
    /** DocutilsWritersLatex2EWriter: Footnotes with numbers/symbols by Docutils. (default) */
    docutilsFootnotes?: boolean;
    /** DocutilsWritersLatex2EWriter: Format for footnote references: one of "superscript" or "brackets".  Default is "superscript". */
    footnoteReferences?: string;
    /** DocutilsWritersLatex2EWriter: Use figure floats for citations (might get mixed with real figures). (default) */
    useLatexCitations?: boolean;
    /** DocutilsWritersLatex2EWriter: Format for block quote attributions: one of "dash" (em-dash prefix), "parentheses"/"parens", or "none".  Default is "dash". */
    attribution?: string;
    /** DocutilsWritersLatex2EWriter: Specify LaTeX packages/stylesheets.  A style is referenced with \usepackage if extension is ".sty" or omitted and with \input else.  Overrides previous --stylesheet and --stylesheet-path settings. */
    stylesheet?: string;
    /** DocutilsWritersLatex2EWriter: Comma separated list of LaTeX packages/stylesheets. Relative paths are expanded if a matching file is found in the --stylesheet-dirs. With --link-stylesheet, the path is rewritten relative to the output *.tex file.  */
    stylesheetPath?: string;
    /** DocutilsWritersLatex2EWriter: Embed the stylesheet(s) in the output file. Stylesheets must be accessible during processing.  */
    embedStylesheet?: boolean;
    /** DocutilsWritersLatex2EWriter: Comma-separated list of directories where stylesheets are found. Used by --stylesheet-path when expanding relative path arguments. Default: "." */
    stylesheetDirs?: string[];
    /** DocutilsWritersLatex2EWriter: Customization by LaTeX code in the preamble. Default: select PDF standard fonts (Times, Helvetica, Courier). */
    latexPreamble?: string;
    /** DocutilsWritersLatex2EWriter: Specify the template file. Default: "default.tex". */
    template?: string;
    /** DocutilsWritersLatex2EWriter: Table of contents by Docutils (without page numbers).  */
    useLatexToc?: boolean;
    /** DocutilsWritersLatex2EWriter: Add parts on top of the section hierarchy. */
    usePartSection?: boolean;
    /** DocutilsWritersLatex2EWriter: Attach author and date to the document title. */
    useLatexDocinfo?: boolean;
    /** DocutilsWritersLatex2EWriter: Use LaTeX abstract environment for the document's abstract.  */
    useLatexAbstract?: boolean;
    /** DocutilsWritersLatex2EWriter: Color of any hyperlinks embedded in text (default: "blue", "false" to disable). */
    hyperlinkColor?: string;
    /** DocutilsWritersLatex2EWriter: Additional options to the "hyperref" package (default: ""). */
    hyperrefOptions?: string;
    /** DocutilsWritersLatex2EWriter: Disable compound enumerators for nested enumerated lists. This is the default. */
    compoundEnumerators?: string;
    /** DocutilsWritersLatex2EWriter: Disable section prefixes for compound enumerators.  This is the default. */
    sectionPrefixForEnumerators?: string;
    /** DocutilsWritersLatex2EWriter: Set the separator between section number and enumerator for compound enumerated lists.  Default is "-". */
    sectionEnumeratorSeparator?: string;
    /** DocutilsWritersLatex2EWriter: When possible, use the specified environment for literal-blocks. Default is quoting of whitespace and special chars. */
    literalBlockEnv?: string;
    /** DocutilsWritersLatex2EWriter: When possible, use verbatim for literal-blocks. Compatibility alias for "--literal-block-env=verbatim". */
    useVerbatimWhenPossible?: boolean;
    /** DocutilsWritersLatex2EWriter: Table style. "standard" with horizontal and vertical lines, "booktabs" (LaTeX booktabs style) only horizontal lines above and below the table and below the header or "borderless".  Default: "standard" */
    tableStyle?: string[]|string;
    /** DocutilsWritersLatex2EWriter: LaTeX graphicx package option. Possible values are "dvips", "pdftex". "auto" includes LaTeX code to use "pdftex" if processing with pdf(la)tex and dvips otherwise. Default is no option. */
    graphicxOption?: string;
    /** DocutilsWritersLatex2EWriter: LaTeX font encoding. Possible values are "", "T1" (default), "OT1", "LGR,T1" or any other combination of options to the `fontenc` package.  */
    fontEncoding?: string;
    /** DocutilsWritersLatex2EWriter: Per default the latex-writer puts the reference title into hyperreferences. Specify "ref*" or "pageref*" to get the section number or the page number. */
    referenceLabel?: string;
    /** DocutilsWritersLatex2EWriter: Specify style and database for bibtex, for example "--use-bibtex=mystyle,mydb1,mydb2". */
    useBibtex?: string;
}

export interface DocutilsWritersOdfOdtWriter {
    /** DocutilsWritersOdfOdtWriter: Specify a stylesheet.  Default: "/usr/share/docutils/writers/odf_odt/styles.odt" */
    stylesheet?: string;
    /** DocutilsWritersOdfOdtWriter: Specify a configuration/mapping file relative to the current working directory for additional ODF options.  In particular, this file may contain a section named "Formats" that maps default style names to names to be used in the resulting output file allowing for adhering to external standards. For more info and the format of the configuration/mapping file, see the odtwriter doc. */
    odfConfigFile?: string;
    /** DocutilsWritersOdfOdtWriter: Do not obfuscate email addresses. */
    cloakEmailAddresses?: boolean;
    /** DocutilsWritersOdfOdtWriter: Specify the thickness of table borders in thousands of a cm.  Default is 35. */
    tableBorderThickness?: string;
    /** DocutilsWritersOdfOdtWriter: Do not add syntax highlighting in literal code blocks. (default) */
    addSyntaxHighlighting?: boolean;
    /** DocutilsWritersOdfOdtWriter: Do not create sections for headers. */
    createSections?: boolean;
    /** DocutilsWritersOdfOdtWriter: Do not create links.  (default) */
    createLinks?: boolean;
    /** DocutilsWritersOdfOdtWriter: Generate footnotes at bottom of page, not endnotes at end of document. (default) */
    endnotesEndDoc?: boolean;
    /** DocutilsWritersOdfOdtWriter: Generate an ODF/oowriter table of contents, not a bullet list. (default) */
    generateOowriterToc?: boolean;
    /** DocutilsWritersOdfOdtWriter: Specify the contents of an custom header line.  See odf_odt writer documentation for details about special field character sequences. */
    customHeader?: string;
    /** DocutilsWritersOdfOdtWriter: Specify the contents of an custom footer line.  See odf_odt writer documentation for details about special field character sequences. */
    customFooter?: string;
}

export interface DocutilsWritersOdfOdtReader {
    /** DocutilsWritersOdfOdtReader: Disable the promotion of a lone top-level section title to document title (and subsequent section title to document subtitle promotion; enabled by default). */
    doctitleXform?: boolean;
    /** DocutilsWritersOdfOdtReader: Disable the bibliographic field list transform (enabled by default). */
    docinfoXform?: boolean;
    /** DocutilsWritersOdfOdtReader: Deactivate the promotion of lone subsection titles. */
    sectsubtitleXform?: string;
}

export interface DocutilsWritersHtml4Css1Writer {
    /** DocutilsWritersHtml4Css1Writer: Specify the template file (UTF-8 encoded).  Default is "/usr/share/docutils/writers/html4css1/template.txt". */
    template?: string;
    /** DocutilsWritersHtml4Css1Writer: Comma separated list of stylesheet URLs. Overrides previous --stylesheet and --stylesheet-path settings. */
    stylesheet?: string;
    /** DocutilsWritersHtml4Css1Writer: Comma separated list of stylesheet paths. Relative paths are expanded if a matching file is found in the --stylesheet-dirs. With --link-stylesheet, the path is rewritten relative to the output HTML file. Default: "html4css1.css" */
    stylesheetPath?: string[];
    /** DocutilsWritersHtml4Css1Writer: Link to the stylesheet(s) in the output HTML file. Default: embed stylesheets. */
    embedStylesheet?: number;
    /** DocutilsWritersHtml4Css1Writer: Comma-separated list of directories where stylesheets are found. Used by --stylesheet-path when expanding relative path arguments. Default: "['.', '/usr/share/docutils/writers/html4css1', '/usr/share/docutils/writers/html5_polyglot']" */
    stylesheetDirs?: string[];
    /** DocutilsWritersHtml4Css1Writer: Specify the initial header level.  Default is 1 for "<h1>".  Does not affect document title & subtitle (see --no-doc-title). */
    initialHeaderLevel?: number;
    /** DocutilsWritersHtml4Css1Writer: Specify the maximum width (in characters) for one-column field names.  Longer field names will span an entire row of the table used to render the field list.  Default is 14 characters.  Use 0 for "no limit". */
    fieldNameLimit?: number;
    /** DocutilsWritersHtml4Css1Writer: Specify the maximum width (in characters) for options in option lists.  Longer options will span an entire row of the table used to render the option list.  Default is 14 characters.  Use 0 for "no limit". */
    optionLimit?: number;
    /** DocutilsWritersHtml4Css1Writer: Format for footnote references: one of "superscript" or "brackets".  Default is "brackets". */
    footnoteReferences?: string;
    /** DocutilsWritersHtml4Css1Writer: Format for block quote attributions: one of "dash" (em-dash prefix), "parentheses"/"parens", or "none".  Default is "dash". */
    attribution?: string;
    /** DocutilsWritersHtml4Css1Writer: Disable compact simple bullet and enumerated lists. */
    compactLists?: number;
    /** DocutilsWritersHtml4Css1Writer: Disable compact simple field lists. */
    compactFieldLists?: number;
    /** DocutilsWritersHtml4Css1Writer: Added to standard table classes. Defined styles: "borderless". Default: "" */
    tableStyle?: string|string[];
    /** DocutilsWritersHtml4Css1Writer: Math output format, one of "MathML", "HTML", "MathJax" or "LaTeX". Default: "HTML math.css" */
    mathOutput?: string;
    /** DocutilsWritersHtml4Css1Writer: Omit the XML declaration.  Use with caution. */
    xmlDeclaration?: boolean;
    /** DocutilsWritersHtml4Css1Writer: Obfuscate email addresses to confuse harvesters while still keeping email links usable with standards-compliant browsers. */
    cloakEmailAddresses?: boolean;
}

export interface DocutilsWritersXetexWriter {
    /** DocutilsWritersXetexWriter: Specify documentclass.  Default is "article". */
    documentclass?: string;
    /** DocutilsWritersXetexWriter: Specify document options.  Multiple options can be given, separated by commas.  Default is "a4paper". */
    documentoptions?: string;
    /** DocutilsWritersXetexWriter: Footnotes with numbers/symbols by Docutils. (default) */
    docutilsFootnotes?: boolean;
    /** DocutilsWritersXetexWriter: Format for footnote references: one of "superscript" or "brackets".  Default is "superscript". */
    footnoteReferences?: string;
    /** DocutilsWritersXetexWriter: Use figure floats for citations (might get mixed with real figures). (default) */
    useLatexCitations?: boolean;
    /** DocutilsWritersXetexWriter: Format for block quote attributions: one of "dash" (em-dash prefix), "parentheses"/"parens", or "none".  Default is "dash". */
    attribution?: string;
    /** DocutilsWritersXetexWriter: Specify LaTeX packages/stylesheets.  A style is referenced with \usepackage if extension is ".sty" or omitted and with \input else.  Overrides previous --stylesheet and --stylesheet-path settings. */
    stylesheet?: string;
    /** DocutilsWritersXetexWriter: Comma separated list of LaTeX packages/stylesheets. Relative paths are expanded if a matching file is found in the --stylesheet-dirs. With --link-stylesheet, the path is rewritten relative to the output *.tex file.  */
    stylesheetPath?: string;
    /** DocutilsWritersXetexWriter: Embed the stylesheet(s) in the output file. Stylesheets must be accessible during processing.  */
    embedStylesheet?: boolean;
    /** DocutilsWritersXetexWriter: Comma-separated list of directories where stylesheets are found. Used by --stylesheet-path when expanding relative path arguments. Default: "." */
    stylesheetDirs?: string;
    /** DocutilsWritersXetexWriter: Customization by LaTeX code in the preamble. Default: select "Linux Libertine" fonts. */
    latexPreamble?: string;
    /** DocutilsWritersXetexWriter: Template file. Default: "xelatex.tex". */
    template?: string;
    /** DocutilsWritersXetexWriter: Table of contents by Docutils (without page numbers).  */
    useLatexToc?: boolean;
    /** DocutilsWritersXetexWriter: Add parts on top of the section hierarchy. */
    usePartSection?: boolean;
    /** DocutilsWritersXetexWriter: Attach author and date to the document title. */
    useLatexDocinfo?: boolean;
    /** DocutilsWritersXetexWriter: Use LaTeX abstract environment for the document's abstract.  */
    useLatexAbstract?: boolean;
    /** DocutilsWritersXetexWriter: Color of any hyperlinks embedded in text (default: "blue", "false" to disable). */
    hyperlinkColor?: string;
    /** DocutilsWritersXetexWriter: Additional options to the "hyperref" package (default: ""). */
    hyperrefOptions?: string;
    /** DocutilsWritersXetexWriter: Disable compound enumerators for nested enumerated lists. This is the default. */
    compoundEnumerators?: string;
    /** DocutilsWritersXetexWriter: Disable section prefixes for compound enumerators.  This is the default. */
    sectionPrefixForEnumerators?: string;
    /** DocutilsWritersXetexWriter: Set the separator between section number and enumerator for compound enumerated lists.  Default is "-". */
    sectionEnumeratorSeparator?: string;
    /** DocutilsWritersXetexWriter: When possible, use the specified environment for literal-blocks. Default is quoting of whitespace and special chars. */
    literalBlockEnv?: string;
    /** DocutilsWritersXetexWriter: When possible, use verbatim for literal-blocks. Compatibility alias for "--literal-block-env=verbatim". */
    useVerbatimWhenPossible?: boolean;
    /** DocutilsWritersXetexWriter: Table style. "standard" with horizontal and vertical lines, "booktabs" (LaTeX booktabs style) only horizontal lines above and below the table and below the header or "borderless".  Default: "standard" */
    tableStyle?: string|string[];
    /** DocutilsWritersXetexWriter: LaTeX graphicx package option. Possible values are "dvips", "pdftex". "auto" includes LaTeX code to use "pdftex" if processing with pdf(la)tex and dvips otherwise. Default is no option. */
    graphicxOption?: string;
    /** DocutilsWritersXetexWriter: Per default the latex-writer puts the reference title into hyperreferences. Specify "ref*" or "pageref*" to get the section number or the page number. */
    referenceLabel?: string;
    /** DocutilsWritersXetexWriter: Specify style and database for bibtex, for example "--use-bibtex=mystyle,mydb1,mydb2". */
    useBibtex?: string;
}

export interface DocutilsWritersHtml5PolyglotWriter {
    /** DocutilsWritersHtml5PolyglotWriter: Specify the template file (UTF-8 encoded).  Default is "/usr/share/docutils/writers/html5_polyglot/template.txt". */
    template?: string;
    /** DocutilsWritersHtml5PolyglotWriter: Comma separated list of stylesheet URLs. Overrides previous --stylesheet and --stylesheet-path settings. */
    stylesheet?: string;
    /** DocutilsWritersHtml5PolyglotWriter: Comma separated list of stylesheet paths. Relative paths are expanded if a matching file is found in the --stylesheet-dirs. With --link-stylesheet, the path is rewritten relative to the output HTML file. Default: "minimal.css,plain.css" */
    stylesheetPath?: string;
    /** DocutilsWritersHtml5PolyglotWriter: Link to the stylesheet(s) in the output HTML file. Default: embed stylesheets. */
    embedStylesheet?: string;
    /** DocutilsWritersHtml5PolyglotWriter: Comma-separated list of directories where stylesheets are found. Used by --stylesheet-path when expanding relative path arguments. Default: "['.', '/usr/share/docutils/writers/html5_polyglot']" */
    stylesheetDirs?: string;
    /** DocutilsWritersHtml5PolyglotWriter: Specify the initial header level.  Default is 1 for "<h1>".  Does not affect document title & subtitle (see --no-doc-title). */
    initialHeaderLevel?: number;
    /** DocutilsWritersHtml5PolyglotWriter: Format for footnote references: one of "superscript" or "brackets".  Default is "brackets". */
    footnoteReferences?: string;
    /** DocutilsWritersHtml5PolyglotWriter: Format for block quote attributions: one of "dash" (em-dash prefix), "parentheses"/"parens", or "none".  Default is "dash". */
    attribution?: string;
    /** DocutilsWritersHtml5PolyglotWriter: Disable compact simple bullet and enumerated lists. */
    compactLists?: string;
    /** DocutilsWritersHtml5PolyglotWriter: Disable compact simple field lists. */
    compactFieldLists?: string;
    /** DocutilsWritersHtml5PolyglotWriter: Added to standard table classes. Defined styles: borderless, booktabs, align-left, align-center, align-right, colwidths-auto. Default: "" */
    tableStyle?: string;
    /** DocutilsWritersHtml5PolyglotWriter: Math output format (one of "MathML", "HTML", "MathJax", or "LaTeX") and option(s). Default: "HTML math.css" */
    mathOutput?: string;
    /** DocutilsWritersHtml5PolyglotWriter: Omit the XML declaration. */
    xmlDeclaration?: string;
    /** DocutilsWritersHtml5PolyglotWriter: Obfuscate email addresses to confuse harvesters while still keeping email links usable with standards-compliant browsers. */
    cloakEmailAddresses?: boolean;
}

export interface DocutilsWritersS5HtmlWriter {
    /** DocutilsWritersS5HtmlWriter: Specify the template file (UTF-8 encoded).  Default is "/usr/share/docutils/writers/html4css1/template.txt". */
    template?: string;
    /** DocutilsWritersS5HtmlWriter: Comma separated list of stylesheet URLs. Overrides previous --stylesheet and --stylesheet-path settings. */
    stylesheet?: string;
    /** DocutilsWritersS5HtmlWriter: Comma separated list of stylesheet paths. Relative paths are expanded if a matching file is found in the --stylesheet-dirs. With --link-stylesheet, the path is rewritten relative to the output HTML file. Default: "html4css1.css" */
    stylesheetPath?: string;
    /** DocutilsWritersS5HtmlWriter: Link to the stylesheet(s) in the output HTML file. Default: embed stylesheets. */
    embedStylesheet?: string;
    /** DocutilsWritersS5HtmlWriter: Comma-separated list of directories where stylesheets are found. Used by --stylesheet-path when expanding relative path arguments. Default: "['.', '/usr/share/docutils/writers/html4css1', '/usr/share/docutils/writers/html5_polyglot']" */
    stylesheetDirs?: string;
    /** DocutilsWritersS5HtmlWriter: Specify the initial header level.  Default is 1 for "<h1>".  Does not affect document title & subtitle (see --no-doc-title). */
    initialHeaderLevel?: number;
    /** DocutilsWritersS5HtmlWriter: Specify the maximum width (in characters) for one-column field names.  Longer field names will span an entire row of the table used to render the field list.  Default is 14 characters.  Use 0 for "no limit". */
    fieldNameLimit?: string;
    /** DocutilsWritersS5HtmlWriter: Specify the maximum width (in characters) for options in option lists.  Longer options will span an entire row of the table used to render the option list.  Default is 14 characters.  Use 0 for "no limit". */
    optionLimit?: string;
    /** DocutilsWritersS5HtmlWriter: Format for footnote references: one of "superscript" or "brackets".  Default is "brackets". */
    footnoteReferences?: string;
    /** DocutilsWritersS5HtmlWriter: Format for block quote attributions: one of "dash" (em-dash prefix), "parentheses"/"parens", or "none".  Default is "dash". */
    attribution?: string;
    /** DocutilsWritersS5HtmlWriter: Disable compact simple bullet and enumerated lists. */
    compactLists?: string;
    /** DocutilsWritersS5HtmlWriter: Disable compact simple field lists. */
    compactFieldLists?: string;
    /** DocutilsWritersS5HtmlWriter: Added to standard table classes. Defined styles: "borderless". Default: "" */
    tableStyle?: string|string[];
    /** DocutilsWritersS5HtmlWriter: Math output format, one of "MathML", "HTML", "MathJax" or "LaTeX". Default: "HTML math.css" */
    mathOutput?: string;
    /** DocutilsWritersS5HtmlWriter: Omit the XML declaration.  Use with caution. */
    xmlDeclaration?: boolean;
    /** DocutilsWritersS5HtmlWriter: Obfuscate email addresses to confuse harvesters while still keeping email links usable with standards-compliant browsers. */
    cloakEmailAddresses?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DocutilsReadersPepReader {
}

export interface DocutilsReadersStandaloneReader {
    /** DocutilsReadersStandaloneReader: Disable the promotion of a lone top-level section title to document title (and subsequent section title to document subtitle promotion; enabled by default). */
    doctitleXform?: boolean;
    /** DocutilsReadersStandaloneReader: Disable the bibliographic field list transform (enabled by default). */
    docinfoXform?: boolean;
    /** DocutilsReadersStandaloneReader: Deactivate the promotion of lone subsection titles. */
    sectsubtitleXform?: boolean;
}

export type Settings = {
    _source?: string;
    _destination?: string;
    } & DocutilsCoreOptionParser & DocutilsFrontendOptionParser & DocutilsParsersRstParser & DocutilsWritersDocutilsXmlWriter & DocutilsWritersPepHtmlWriter & DocutilsWritersLatex2EWriter & DocutilsWritersOdfOdtWriter & DocutilsWritersOdfOdtReader & DocutilsWritersHtml4Css1Writer & DocutilsWritersXetexWriter & DocutilsWritersHtml5PolyglotWriter & DocutilsWritersS5HtmlWriter & DocutilsReadersPepReader & DocutilsReadersStandaloneReader;
