export interface DocutilsCoreOptionParser {
    /** DocutilsCoreOptionParser: Specify the document title as metadata. */
    title?: any;
    /** DocutilsCoreOptionParser: Do not include a generator credit. */
    generator?: any;
    /** DocutilsCoreOptionParser: Do not include a datestamp of any kind. */
    datestamp?: any;
    /** DocutilsCoreOptionParser: Include a "View document source" link. */
    sourceLink?: boolean;
    /** DocutilsCoreOptionParser: Use <URL> for a source link; implies --source-link. */
    sourceUrl?: any;
    /** DocutilsCoreOptionParser: Do not include a "View document source" link. */
    noSourceLink?: any;
    /** DocutilsCoreOptionParser: Disable backlinks to the table of contents. */
    tocBacklinks?: any;
    /** DocutilsCoreOptionParser: Disable backlinks from footnotes and citations. */
    footnoteBacklinks?: any;
    /** DocutilsCoreOptionParser: Disable section numbering by Docutils. */
    sectnumXform?: any;
    /** DocutilsCoreOptionParser: Leave comment elements in the document tree. (default) */
    stripComments?: any;
    /** DocutilsCoreOptionParser: Remove all elements with classes="<class>" from the document tree. Warning: potentially dangerous; use with caution. (Multiple-use option.) */
    stripElementsWithClasses?: any;
    /** DocutilsCoreOptionParser: Remove all classes="<class>" attributes from elements in the document tree. Warning: potentially dangerous; use with caution. (Multiple-use option.) */
    stripClasses?: any;
    /** DocutilsCoreOptionParser: Report no system messages.  (Same as "--report=5".) */
    reportLevel?: any;
    /** DocutilsCoreOptionParser: Halt at the slightest problem.  Same as "--halt=info". */
    haltLevel?: any;
    /** DocutilsCoreOptionParser: Enable a non-zero exit status for non-halting system messages at or above <level>.  Default: 5 (disabled). */
    exitStatusLevel?: any;
    /** DocutilsCoreOptionParser: Disable debug output.  (default) */
    debug?: any;
    /** DocutilsCoreOptionParser: Send the output of system messages to <file>. */
    warningStream?: any;
    /** DocutilsCoreOptionParser: Disable Python tracebacks.  (default) */
    traceback?: any;
    /** DocutilsCoreOptionParser: Specify the encoding and optionally the error handler of input text.  Default: <locale-dependent>:strict. */
    inputEncoding?: any;
    /** DocutilsCoreOptionParser: Specify the error handler for undecodable characters.  Choices: "strict" (default), "ignore", and "replace". */
    inputEncodingErrorHandler?: any;
    /** DocutilsCoreOptionParser: Specify the text encoding and optionally the error handler for output.  Default: UTF-8:strict. */
    outputEncoding?: any;
    /** DocutilsCoreOptionParser: Specify error handler for unencodable output characters; "strict" (default), "ignore", "replace", "xmlcharrefreplace", "backslashreplace". */
    outputEncodingErrorHandler?: any;
    /** DocutilsCoreOptionParser: Specify text encoding and error handler for error output.  Default text encoding: system encoding. Default error handler: backslashreplace. */
    errorEncoding?: any;
    /** DocutilsCoreOptionParser: Specify the error handler for unencodable characters in error output.  Default: backslashreplace. */
    errorEncodingErrorHandler?: any;
    /** DocutilsCoreOptionParser: Specify the language (as BCP 47 language tag).  Default: en. */
    languageCode?: any;
    /** DocutilsCoreOptionParser: Write output file dependencies to <file>. */
    recordDependencies?: any;
    /** DocutilsCoreOptionParser: Read configuration settings from <file>, if it exists. */
    config?: any;
    /** DocutilsCoreOptionParser: Show this program's version number and exit. */
    version?: any;
    /** DocutilsCoreOptionParser: Show this help message and exit. */
    help?: any;
    /** DocutilsCoreOptionParser: SUPPRESSHELP */
    idPrefix?: any;
    /** DocutilsCoreOptionParser: SUPPRESSHELP */
    autoIdPrefix?: any;
    /** DocutilsCoreOptionParser: SUPPRESSHELP */
    dumpSettings?: any;
    /** DocutilsCoreOptionParser: SUPPRESSHELP */
    dumpInternals?: any;
    /** DocutilsCoreOptionParser: SUPPRESSHELP */
    dumpTransforms?: any;
    /** DocutilsCoreOptionParser: SUPPRESSHELP */
    dumpPseudoXml?: any;
    /** DocutilsCoreOptionParser: SUPPRESSHELP */
    exposeInternals?: any;
    /** DocutilsCoreOptionParser: SUPPRESSHELP */
    strictVisitor?: any;
}

export interface DocutilsFrontendOptionParser {
    /** DocutilsFrontendOptionParser: Specify the document title as metadata. */
    title?: any;
    /** DocutilsFrontendOptionParser: Do not include a generator credit. */
    generator?: any;
    /** DocutilsFrontendOptionParser: Do not include a datestamp of any kind. */
    datestamp?: any;
    /** DocutilsFrontendOptionParser: Include a "View document source" link. */
    sourceLink?: boolean;
    /** DocutilsFrontendOptionParser: Use <URL> for a source link; implies --source-link. */
    sourceUrl?: any;
    /** DocutilsFrontendOptionParser: Do not include a "View document source" link. */
    noSourceLink?: any;
    /** DocutilsFrontendOptionParser: Disable backlinks to the table of contents. */
    tocBacklinks?: any;
    /** DocutilsFrontendOptionParser: Disable backlinks from footnotes and citations. */
    footnoteBacklinks?: any;
    /** DocutilsFrontendOptionParser: Disable section numbering by Docutils. */
    sectnumXform?: any;
    /** DocutilsFrontendOptionParser: Leave comment elements in the document tree. (default) */
    stripComments?: any;
    /** DocutilsFrontendOptionParser: Remove all elements with classes="<class>" from the document tree. Warning: potentially dangerous; use with caution. (Multiple-use option.) */
    stripElementsWithClasses?: any;
    /** DocutilsFrontendOptionParser: Remove all classes="<class>" attributes from elements in the document tree. Warning: potentially dangerous; use with caution. (Multiple-use option.) */
    stripClasses?: any;
    /** DocutilsFrontendOptionParser: Report no system messages.  (Same as "--report=5".) */
    reportLevel?: any;
    /** DocutilsFrontendOptionParser: Halt at the slightest problem.  Same as "--halt=info". */
    haltLevel?: any;
    /** DocutilsFrontendOptionParser: Enable a non-zero exit status for non-halting system messages at or above <level>.  Default: 5 (disabled). */
    exitStatusLevel?: any;
    /** DocutilsFrontendOptionParser: Disable debug output.  (default) */
    debug?: any;
    /** DocutilsFrontendOptionParser: Send the output of system messages to <file>. */
    warningStream?: any;
    /** DocutilsFrontendOptionParser: Disable Python tracebacks.  (default) */
    traceback?: any;
    /** DocutilsFrontendOptionParser: Specify the encoding and optionally the error handler of input text.  Default: <locale-dependent>:strict. */
    inputEncoding?: any;
    /** DocutilsFrontendOptionParser: Specify the error handler for undecodable characters.  Choices: "strict" (default), "ignore", and "replace". */
    inputEncodingErrorHandler?: any;
    /** DocutilsFrontendOptionParser: Specify the text encoding and optionally the error handler for output.  Default: UTF-8:strict. */
    outputEncoding?: any;
    /** DocutilsFrontendOptionParser: Specify error handler for unencodable output characters; "strict" (default), "ignore", "replace", "xmlcharrefreplace", "backslashreplace". */
    outputEncodingErrorHandler?: any;
    /** DocutilsFrontendOptionParser: Specify text encoding and error handler for error output.  Default text encoding: system encoding. Default error handler: backslashreplace. */
    errorEncoding?: any;
    /** DocutilsFrontendOptionParser: Specify the error handler for unencodable characters in error output.  Default: backslashreplace. */
    errorEncodingErrorHandler?: any;
    /** DocutilsFrontendOptionParser: Specify the language (as BCP 47 language tag).  Default: en. */
    languageCode?: any;
    /** DocutilsFrontendOptionParser: Write output file dependencies to <file>. */
    recordDependencies?: any;
    /** DocutilsFrontendOptionParser: Read configuration settings from <file>, if it exists. */
    config?: any;
    /** DocutilsFrontendOptionParser: Show this program's version number and exit. */
    version?: any;
    /** DocutilsFrontendOptionParser: Show this help message and exit. */
    help?: any;
    /** DocutilsFrontendOptionParser: SUPPRESSHELP */
    idPrefix?: any;
    /** DocutilsFrontendOptionParser: SUPPRESSHELP */
    autoIdPrefix?: any;
    /** DocutilsFrontendOptionParser: SUPPRESSHELP */
    dumpSettings?: any;
    /** DocutilsFrontendOptionParser: SUPPRESSHELP */
    dumpInternals?: any;
    /** DocutilsFrontendOptionParser: SUPPRESSHELP */
    dumpTransforms?: any;
    /** DocutilsFrontendOptionParser: SUPPRESSHELP */
    dumpPseudoXml?: any;
    /** DocutilsFrontendOptionParser: SUPPRESSHELP */
    exposeInternals?: any;
    /** DocutilsFrontendOptionParser: SUPPRESSHELP */
    strictVisitor?: any;
}

export interface DocutilsParsersRstParser {
    /** DocutilsParsersRstParser: Recognize and link to standalone PEP references (like "PEP 258"). */
    pepReferences?: boolean;
    /** DocutilsParsersRstParser: Base URL for PEP references (default "http://www.python.org/dev/peps/"). */
    pepBaseUrl?: any;
    /** DocutilsParsersRstParser: Template for PEP file part of URL. (default "pep-%04d") */
    pepFileUrlTemplate?: any;
    /** DocutilsParsersRstParser: Recognize and link to standalone RFC references (like "RFC 822"). */
    rfcReferences?: boolean;
    /** DocutilsParsersRstParser: Base URL for RFC references (default "http://tools.ietf.org/html/"). */
    rfcBaseUrl?: any;
    /** DocutilsParsersRstParser: Set number of spaces for tab expansion (default 8). */
    tabWidth?: any;
    /** DocutilsParsersRstParser: Leave spaces before footnote references. */
    trimFootnoteReferenceSpace?: any;
    /** DocutilsParsersRstParser: Enable directives that insert the contents of external file ("include" & "raw").  Enabled by default. */
    fileInsertionEnabled?: any;
    /** DocutilsParsersRstParser: Enable the "raw" directive.  Enabled by default. */
    rawEnabled?: any;
    /** DocutilsParsersRstParser: Token name set for parsing code with Pygments: one of "long", "short", or "none (no parsing)". Default is "long". */
    syntaxHighlight?: any;
    /** DocutilsParsersRstParser: Change straight quotation marks to typographic form: one of "yes", "no", "alt[ernative]" (default "no"). */
    smartQuotes?: any;
    /** DocutilsParsersRstParser: Characters to use as "smart quotes" for <language>.  */
    smartquotesLocales?: any;
    /** DocutilsParsersRstParser: Inline markup recognized anywhere, regardless of surrounding characters. Backslash-escapes must be used to avoid unwanted markup recognition. Useful for East Asian languages. Experimental. */
    characterLevelInlineMarkup?: any;
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
    template?: any;
    /** DocutilsWritersPepHtmlWriter: Comma separated list of stylesheet URLs. Overrides previous --stylesheet and --stylesheet-path settings. */
    stylesheet?: any;
    /** DocutilsWritersPepHtmlWriter: Comma separated list of stylesheet paths. Relative paths are expanded if a matching file is found in the --stylesheet-dirs. With --link-stylesheet, the path is rewritten relative to the output HTML file. Default: "html4css1.css" */
    stylesheetPath?: any;
    /** DocutilsWritersPepHtmlWriter: Link to the stylesheet(s) in the output HTML file. Default: embed stylesheets. */
    embedStylesheet?: any;
    /** DocutilsWritersPepHtmlWriter: Comma-separated list of directories where stylesheets are found. Used by --stylesheet-path when expanding relative path arguments. Default: "['.', '/usr/share/docutils/writers/html4css1', '/usr/share/docutils/writers/html5_polyglot']" */
    stylesheetDirs?: any;
    /** DocutilsWritersPepHtmlWriter: Specify the initial header level.  Default is 1 for "<h1>".  Does not affect document title & subtitle (see --no-doc-title). */
    initialHeaderLevel?: any;
    /** DocutilsWritersPepHtmlWriter: Specify the maximum width (in characters) for one-column field names.  Longer field names will span an entire row of the table used to render the field list.  Default is 14 characters.  Use 0 for "no limit". */
    fieldNameLimit?: any;
    /** DocutilsWritersPepHtmlWriter: Specify the maximum width (in characters) for options in option lists.  Longer options will span an entire row of the table used to render the option list.  Default is 14 characters.  Use 0 for "no limit". */
    optionLimit?: any;
    /** DocutilsWritersPepHtmlWriter: Format for footnote references: one of "superscript" or "brackets".  Default is "brackets". */
    footnoteReferences?: any;
    /** DocutilsWritersPepHtmlWriter: Format for block quote attributions: one of "dash" (em-dash prefix), "parentheses"/"parens", or "none".  Default is "dash". */
    attribution?: any;
    /** DocutilsWritersPepHtmlWriter: Disable compact simple bullet and enumerated lists. */
    compactLists?: any;
    /** DocutilsWritersPepHtmlWriter: Disable compact simple field lists. */
    compactFieldLists?: any;
    /** DocutilsWritersPepHtmlWriter: Added to standard table classes. Defined styles: "borderless". Default: "" */
    tableStyle?: any;
    /** DocutilsWritersPepHtmlWriter: Math output format, one of "MathML", "HTML", "MathJax" or "LaTeX". Default: "HTML math.css" */
    mathOutput?: any;
    /** DocutilsWritersPepHtmlWriter: Omit the XML declaration.  Use with caution. */
    xmlDeclaration?: boolean;
    /** DocutilsWritersPepHtmlWriter: Obfuscate email addresses to confuse harvesters while still keeping email links usable with standards-compliant browsers. */
    cloakEmailAddresses?: boolean;
}

export interface DocutilsWritersLatex2EWriter {
    /** DocutilsWritersLatex2EWriter: Specify documentclass.  Default is "article". */
    documentclass?: any;
    /** DocutilsWritersLatex2EWriter: Specify document options.  Multiple options can be given, separated by commas.  Default is "a4paper". */
    documentoptions?: any;
    /** DocutilsWritersLatex2EWriter: Footnotes with numbers/symbols by Docutils. (default) */
    docutilsFootnotes?: boolean;
    /** DocutilsWritersLatex2EWriter: Format for footnote references: one of "superscript" or "brackets".  Default is "superscript". */
    footnoteReferences?: any;
    /** DocutilsWritersLatex2EWriter: Use figure floats for citations (might get mixed with real figures). (default) */
    useLatexCitations?: boolean;
    /** DocutilsWritersLatex2EWriter: Format for block quote attributions: one of "dash" (em-dash prefix), "parentheses"/"parens", or "none".  Default is "dash". */
    attribution?: any;
    /** DocutilsWritersLatex2EWriter: Specify LaTeX packages/stylesheets.  A style is referenced with \usepackage if extension is ".sty" or omitted and with \input else.  Overrides previous --stylesheet and --stylesheet-path settings. */
    stylesheet?: any;
    /** DocutilsWritersLatex2EWriter: Comma separated list of LaTeX packages/stylesheets. Relative paths are expanded if a matching file is found in the --stylesheet-dirs. With --link-stylesheet, the path is rewritten relative to the output *.tex file.  */
    stylesheetPath?: any;
    /** DocutilsWritersLatex2EWriter: Embed the stylesheet(s) in the output file. Stylesheets must be accessible during processing.  */
    embedStylesheet?: boolean;
    /** DocutilsWritersLatex2EWriter: Comma-separated list of directories where stylesheets are found. Used by --stylesheet-path when expanding relative path arguments. Default: "." */
    stylesheetDirs?: any;
    /** DocutilsWritersLatex2EWriter: Customization by LaTeX code in the preamble. Default: select PDF standard fonts (Times, Helvetica, Courier). */
    latexPreamble?: any;
    /** DocutilsWritersLatex2EWriter: Specify the template file. Default: "default.tex". */
    template?: any;
    /** DocutilsWritersLatex2EWriter: Table of contents by Docutils (without page numbers).  */
    useLatexToc?: boolean;
    /** DocutilsWritersLatex2EWriter: Add parts on top of the section hierarchy. */
    usePartSection?: boolean;
    /** DocutilsWritersLatex2EWriter: Attach author and date to the document title. */
    useLatexDocinfo?: boolean;
    /** DocutilsWritersLatex2EWriter: Use LaTeX abstract environment for the document's abstract.  */
    useLatexAbstract?: boolean;
    /** DocutilsWritersLatex2EWriter: Color of any hyperlinks embedded in text (default: "blue", "false" to disable). */
    hyperlinkColor?: any;
    /** DocutilsWritersLatex2EWriter: Additional options to the "hyperref" package (default: ""). */
    hyperrefOptions?: any;
    /** DocutilsWritersLatex2EWriter: Disable compound enumerators for nested enumerated lists. This is the default. */
    compoundEnumerators?: any;
    /** DocutilsWritersLatex2EWriter: Disable section prefixes for compound enumerators.  This is the default. */
    sectionPrefixForEnumerators?: any;
    /** DocutilsWritersLatex2EWriter: Set the separator between section number and enumerator for compound enumerated lists.  Default is "-". */
    sectionEnumeratorSeparator?: any;
    /** DocutilsWritersLatex2EWriter: When possible, use the specified environment for literal-blocks. Default is quoting of whitespace and special chars. */
    literalBlockEnv?: any;
    /** DocutilsWritersLatex2EWriter: When possible, use verbatim for literal-blocks. Compatibility alias for "--literal-block-env=verbatim". */
    useVerbatimWhenPossible?: boolean;
    /** DocutilsWritersLatex2EWriter: Table style. "standard" with horizontal and vertical lines, "booktabs" (LaTeX booktabs style) only horizontal lines above and below the table and below the header or "borderless".  Default: "standard" */
    tableStyle?: any;
    /** DocutilsWritersLatex2EWriter: LaTeX graphicx package option. Possible values are "dvips", "pdftex". "auto" includes LaTeX code to use "pdftex" if processing with pdf(la)tex and dvips otherwise. Default is no option. */
    graphicxOption?: any;
    /** DocutilsWritersLatex2EWriter: LaTeX font encoding. Possible values are "", "T1" (default), "OT1", "LGR,T1" or any other combination of options to the `fontenc` package.  */
    fontEncoding?: any;
    /** DocutilsWritersLatex2EWriter: Per default the latex-writer puts the reference title into hyperreferences. Specify "ref*" or "pageref*" to get the section number or the page number. */
    referenceLabel?: any;
    /** DocutilsWritersLatex2EWriter: Specify style and database for bibtex, for example "--use-bibtex=mystyle,mydb1,mydb2". */
    useBibtex?: any;
}

export interface DocutilsWritersOdfOdtWriter {
    /** DocutilsWritersOdfOdtWriter: Specify a stylesheet.  Default: "/usr/share/docutils/writers/odf_odt/styles.odt" */
    stylesheet?: any;
    /** DocutilsWritersOdfOdtWriter: Specify a configuration/mapping file relative to the current working directory for additional ODF options.  In particular, this file may contain a section named "Formats" that maps default style names to names to be used in the resulting output file allowing for adhering to external standards. For more info and the format of the configuration/mapping file, see the odtwriter doc. */
    odfConfigFile?: any;
    /** DocutilsWritersOdfOdtWriter: Do not obfuscate email addresses. */
    cloakEmailAddresses?: boolean;
    /** DocutilsWritersOdfOdtWriter: Specify the thickness of table borders in thousands of a cm.  Default is 35. */
    tableBorderThickness?: any;
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
    customHeader?: any;
    /** DocutilsWritersOdfOdtWriter: Specify the contents of an custom footer line.  See odf_odt writer documentation for details about special field character sequences. */
    customFooter?: any;
}

export interface DocutilsWritersOdfOdtReader {
    /** DocutilsWritersOdfOdtReader: Disable the promotion of a lone top-level section title to document title (and subsequent section title to document subtitle promotion; enabled by default). */
    doctitleXform?: boolean;
    /** DocutilsWritersOdfOdtReader: Disable the bibliographic field list transform (enabled by default). */
    docinfoXform?: boolean;
    /** DocutilsWritersOdfOdtReader: Deactivate the promotion of lone subsection titles. */
    sectsubtitleXform?: any;
}

export interface DocutilsWritersHtml4Css1Writer {
    /** DocutilsWritersHtml4Css1Writer: Specify the template file (UTF-8 encoded).  Default is "/usr/share/docutils/writers/html4css1/template.txt". */
    template?: any;
    /** DocutilsWritersHtml4Css1Writer: Comma separated list of stylesheet URLs. Overrides previous --stylesheet and --stylesheet-path settings. */
    stylesheet?: any;
    /** DocutilsWritersHtml4Css1Writer: Comma separated list of stylesheet paths. Relative paths are expanded if a matching file is found in the --stylesheet-dirs. With --link-stylesheet, the path is rewritten relative to the output HTML file. Default: "html4css1.css" */
    stylesheetPath?: any;
    /** DocutilsWritersHtml4Css1Writer: Link to the stylesheet(s) in the output HTML file. Default: embed stylesheets. */
    embedStylesheet?: any;
    /** DocutilsWritersHtml4Css1Writer: Comma-separated list of directories where stylesheets are found. Used by --stylesheet-path when expanding relative path arguments. Default: "['.', '/usr/share/docutils/writers/html4css1', '/usr/share/docutils/writers/html5_polyglot']" */
    stylesheetDirs?: any;
    /** DocutilsWritersHtml4Css1Writer: Specify the initial header level.  Default is 1 for "<h1>".  Does not affect document title & subtitle (see --no-doc-title). */
    initialHeaderLevel?: any;
    /** DocutilsWritersHtml4Css1Writer: Specify the maximum width (in characters) for one-column field names.  Longer field names will span an entire row of the table used to render the field list.  Default is 14 characters.  Use 0 for "no limit". */
    fieldNameLimit?: any;
    /** DocutilsWritersHtml4Css1Writer: Specify the maximum width (in characters) for options in option lists.  Longer options will span an entire row of the table used to render the option list.  Default is 14 characters.  Use 0 for "no limit". */
    optionLimit?: any;
    /** DocutilsWritersHtml4Css1Writer: Format for footnote references: one of "superscript" or "brackets".  Default is "brackets". */
    footnoteReferences?: any;
    /** DocutilsWritersHtml4Css1Writer: Format for block quote attributions: one of "dash" (em-dash prefix), "parentheses"/"parens", or "none".  Default is "dash". */
    attribution?: any;
    /** DocutilsWritersHtml4Css1Writer: Disable compact simple bullet and enumerated lists. */
    compactLists?: any;
    /** DocutilsWritersHtml4Css1Writer: Disable compact simple field lists. */
    compactFieldLists?: any;
    /** DocutilsWritersHtml4Css1Writer: Added to standard table classes. Defined styles: "borderless". Default: "" */
    tableStyle?: any;
    /** DocutilsWritersHtml4Css1Writer: Math output format, one of "MathML", "HTML", "MathJax" or "LaTeX". Default: "HTML math.css" */
    mathOutput?: any;
    /** DocutilsWritersHtml4Css1Writer: Omit the XML declaration.  Use with caution. */
    xmlDeclaration?: boolean;
    /** DocutilsWritersHtml4Css1Writer: Obfuscate email addresses to confuse harvesters while still keeping email links usable with standards-compliant browsers. */
    cloakEmailAddresses?: boolean;
}

export interface DocutilsWritersXetexWriter {
    /** DocutilsWritersXetexWriter: Specify documentclass.  Default is "article". */
    documentclass?: any;
    /** DocutilsWritersXetexWriter: Specify document options.  Multiple options can be given, separated by commas.  Default is "a4paper". */
    documentoptions?: any;
    /** DocutilsWritersXetexWriter: Footnotes with numbers/symbols by Docutils. (default) */
    docutilsFootnotes?: boolean;
    /** DocutilsWritersXetexWriter: Format for footnote references: one of "superscript" or "brackets".  Default is "superscript". */
    footnoteReferences?: any;
    /** DocutilsWritersXetexWriter: Use figure floats for citations (might get mixed with real figures). (default) */
    useLatexCitations?: boolean;
    /** DocutilsWritersXetexWriter: Format for block quote attributions: one of "dash" (em-dash prefix), "parentheses"/"parens", or "none".  Default is "dash". */
    attribution?: any;
    /** DocutilsWritersXetexWriter: Specify LaTeX packages/stylesheets.  A style is referenced with \usepackage if extension is ".sty" or omitted and with \input else.  Overrides previous --stylesheet and --stylesheet-path settings. */
    stylesheet?: any;
    /** DocutilsWritersXetexWriter: Comma separated list of LaTeX packages/stylesheets. Relative paths are expanded if a matching file is found in the --stylesheet-dirs. With --link-stylesheet, the path is rewritten relative to the output *.tex file.  */
    stylesheetPath?: any;
    /** DocutilsWritersXetexWriter: Embed the stylesheet(s) in the output file. Stylesheets must be accessible during processing.  */
    embedStylesheet?: boolean;
    /** DocutilsWritersXetexWriter: Comma-separated list of directories where stylesheets are found. Used by --stylesheet-path when expanding relative path arguments. Default: "." */
    stylesheetDirs?: any;
    /** DocutilsWritersXetexWriter: Customization by LaTeX code in the preamble. Default: select "Linux Libertine" fonts. */
    latexPreamble?: any;
    /** DocutilsWritersXetexWriter: Template file. Default: "xelatex.tex". */
    template?: any;
    /** DocutilsWritersXetexWriter: Table of contents by Docutils (without page numbers).  */
    useLatexToc?: boolean;
    /** DocutilsWritersXetexWriter: Add parts on top of the section hierarchy. */
    usePartSection?: boolean;
    /** DocutilsWritersXetexWriter: Attach author and date to the document title. */
    useLatexDocinfo?: boolean;
    /** DocutilsWritersXetexWriter: Use LaTeX abstract environment for the document's abstract.  */
    useLatexAbstract?: boolean;
    /** DocutilsWritersXetexWriter: Color of any hyperlinks embedded in text (default: "blue", "false" to disable). */
    hyperlinkColor?: any;
    /** DocutilsWritersXetexWriter: Additional options to the "hyperref" package (default: ""). */
    hyperrefOptions?: any;
    /** DocutilsWritersXetexWriter: Disable compound enumerators for nested enumerated lists. This is the default. */
    compoundEnumerators?: any;
    /** DocutilsWritersXetexWriter: Disable section prefixes for compound enumerators.  This is the default. */
    sectionPrefixForEnumerators?: any;
    /** DocutilsWritersXetexWriter: Set the separator between section number and enumerator for compound enumerated lists.  Default is "-". */
    sectionEnumeratorSeparator?: any;
    /** DocutilsWritersXetexWriter: When possible, use the specified environment for literal-blocks. Default is quoting of whitespace and special chars. */
    literalBlockEnv?: any;
    /** DocutilsWritersXetexWriter: When possible, use verbatim for literal-blocks. Compatibility alias for "--literal-block-env=verbatim". */
    useVerbatimWhenPossible?: boolean;
    /** DocutilsWritersXetexWriter: Table style. "standard" with horizontal and vertical lines, "booktabs" (LaTeX booktabs style) only horizontal lines above and below the table and below the header or "borderless".  Default: "standard" */
    tableStyle?: any;
    /** DocutilsWritersXetexWriter: LaTeX graphicx package option. Possible values are "dvips", "pdftex". "auto" includes LaTeX code to use "pdftex" if processing with pdf(la)tex and dvips otherwise. Default is no option. */
    graphicxOption?: any;
    /** DocutilsWritersXetexWriter: Per default the latex-writer puts the reference title into hyperreferences. Specify "ref*" or "pageref*" to get the section number or the page number. */
    referenceLabel?: any;
    /** DocutilsWritersXetexWriter: Specify style and database for bibtex, for example "--use-bibtex=mystyle,mydb1,mydb2". */
    useBibtex?: any;
}

export interface DocutilsWritersHtml5PolyglotWriter {
    /** DocutilsWritersHtml5PolyglotWriter: Specify the template file (UTF-8 encoded).  Default is "/usr/share/docutils/writers/html5_polyglot/template.txt". */
    template?: any;
    /** DocutilsWritersHtml5PolyglotWriter: Comma separated list of stylesheet URLs. Overrides previous --stylesheet and --stylesheet-path settings. */
    stylesheet?: any;
    /** DocutilsWritersHtml5PolyglotWriter: Comma separated list of stylesheet paths. Relative paths are expanded if a matching file is found in the --stylesheet-dirs. With --link-stylesheet, the path is rewritten relative to the output HTML file. Default: "minimal.css,plain.css" */
    stylesheetPath?: any;
    /** DocutilsWritersHtml5PolyglotWriter: Link to the stylesheet(s) in the output HTML file. Default: embed stylesheets. */
    embedStylesheet?: any;
    /** DocutilsWritersHtml5PolyglotWriter: Comma-separated list of directories where stylesheets are found. Used by --stylesheet-path when expanding relative path arguments. Default: "['.', '/usr/share/docutils/writers/html5_polyglot']" */
    stylesheetDirs?: any;
    /** DocutilsWritersHtml5PolyglotWriter: Specify the initial header level.  Default is 1 for "<h1>".  Does not affect document title & subtitle (see --no-doc-title). */
    initialHeaderLevel?: any;
    /** DocutilsWritersHtml5PolyglotWriter: Format for footnote references: one of "superscript" or "brackets".  Default is "brackets". */
    footnoteReferences?: any;
    /** DocutilsWritersHtml5PolyglotWriter: Format for block quote attributions: one of "dash" (em-dash prefix), "parentheses"/"parens", or "none".  Default is "dash". */
    attribution?: any;
    /** DocutilsWritersHtml5PolyglotWriter: Disable compact simple bullet and enumerated lists. */
    compactLists?: any;
    /** DocutilsWritersHtml5PolyglotWriter: Disable compact simple field lists. */
    compactFieldLists?: any;
    /** DocutilsWritersHtml5PolyglotWriter: Added to standard table classes. Defined styles: borderless, booktabs, align-left, align-center, align-right, colwidths-auto. Default: "" */
    tableStyle?: any;
    /** DocutilsWritersHtml5PolyglotWriter: Math output format (one of "MathML", "HTML", "MathJax", or "LaTeX") and option(s). Default: "HTML math.css" */
    mathOutput?: any;
    /** DocutilsWritersHtml5PolyglotWriter: Omit the XML declaration. */
    xmlDeclaration?: any;
    /** DocutilsWritersHtml5PolyglotWriter: Obfuscate email addresses to confuse harvesters while still keeping email links usable with standards-compliant browsers. */
    cloakEmailAddresses?: boolean;
}

export interface DocutilsWritersS5HtmlWriter {
    /** DocutilsWritersS5HtmlWriter: Specify the template file (UTF-8 encoded).  Default is "/usr/share/docutils/writers/html4css1/template.txt". */
    template?: any;
    /** DocutilsWritersS5HtmlWriter: Comma separated list of stylesheet URLs. Overrides previous --stylesheet and --stylesheet-path settings. */
    stylesheet?: any;
    /** DocutilsWritersS5HtmlWriter: Comma separated list of stylesheet paths. Relative paths are expanded if a matching file is found in the --stylesheet-dirs. With --link-stylesheet, the path is rewritten relative to the output HTML file. Default: "html4css1.css" */
    stylesheetPath?: any;
    /** DocutilsWritersS5HtmlWriter: Link to the stylesheet(s) in the output HTML file. Default: embed stylesheets. */
    embedStylesheet?: any;
    /** DocutilsWritersS5HtmlWriter: Comma-separated list of directories where stylesheets are found. Used by --stylesheet-path when expanding relative path arguments. Default: "['.', '/usr/share/docutils/writers/html4css1', '/usr/share/docutils/writers/html5_polyglot']" */
    stylesheetDirs?: any;
    /** DocutilsWritersS5HtmlWriter: Specify the initial header level.  Default is 1 for "<h1>".  Does not affect document title & subtitle (see --no-doc-title). */
    initialHeaderLevel?: any;
    /** DocutilsWritersS5HtmlWriter: Specify the maximum width (in characters) for one-column field names.  Longer field names will span an entire row of the table used to render the field list.  Default is 14 characters.  Use 0 for "no limit". */
    fieldNameLimit?: any;
    /** DocutilsWritersS5HtmlWriter: Specify the maximum width (in characters) for options in option lists.  Longer options will span an entire row of the table used to render the option list.  Default is 14 characters.  Use 0 for "no limit". */
    optionLimit?: any;
    /** DocutilsWritersS5HtmlWriter: Format for footnote references: one of "superscript" or "brackets".  Default is "brackets". */
    footnoteReferences?: any;
    /** DocutilsWritersS5HtmlWriter: Format for block quote attributions: one of "dash" (em-dash prefix), "parentheses"/"parens", or "none".  Default is "dash". */
    attribution?: any;
    /** DocutilsWritersS5HtmlWriter: Disable compact simple bullet and enumerated lists. */
    compactLists?: any;
    /** DocutilsWritersS5HtmlWriter: Disable compact simple field lists. */
    compactFieldLists?: any;
    /** DocutilsWritersS5HtmlWriter: Added to standard table classes. Defined styles: "borderless". Default: "" */
    tableStyle?: any;
    /** DocutilsWritersS5HtmlWriter: Math output format, one of "MathML", "HTML", "MathJax" or "LaTeX". Default: "HTML math.css" */
    mathOutput?: any;
    /** DocutilsWritersS5HtmlWriter: Omit the XML declaration.  Use with caution. */
    xmlDeclaration?: boolean;
    /** DocutilsWritersS5HtmlWriter: Obfuscate email addresses to confuse harvesters while still keeping email links usable with standards-compliant browsers. */
    cloakEmailAddresses?: boolean;
}

export interface DocutilsReadersPepReader {
}

export interface DocutilsReadersStandaloneReader {
    /** DocutilsReadersStandaloneReader: Disable the promotion of a lone top-level section title to document title (and subsequent section title to document subtitle promotion; enabled by default). */
    doctitleXform?: boolean;
    /** DocutilsReadersStandaloneReader: Disable the bibliographic field list transform (enabled by default). */
    docinfoXform?: boolean;
    /** DocutilsReadersStandaloneReader: Deactivate the promotion of lone subsection titles. */
    sectsubtitleXform?: any;
}

export interface Settings {
    _source?: string;
    _destination?: string;
docutilsCoreOptionParser?: DocutilsCoreOptionParser;
docutilsFrontendOptionParser?: DocutilsFrontendOptionParser;
docutilsParsersRstParser?: DocutilsParsersRstParser;
docutilsWritersDocutilsXmlWriter?: DocutilsWritersDocutilsXmlWriter;
docutilsWritersPepHtmlWriter?: DocutilsWritersPepHtmlWriter;
docutilsWritersLatex2EWriter?: DocutilsWritersLatex2EWriter;
docutilsWritersOdfOdtWriter?: DocutilsWritersOdfOdtWriter;
docutilsWritersOdfOdtReader?: DocutilsWritersOdfOdtReader;
docutilsWritersHtml4Css1Writer?: DocutilsWritersHtml4Css1Writer;
docutilsWritersXetexWriter?: DocutilsWritersXetexWriter;
docutilsWritersHtml5PolyglotWriter?: DocutilsWritersHtml5PolyglotWriter;
docutilsWritersS5HtmlWriter?: DocutilsWritersS5HtmlWriter;
docutilsReadersPepReader?: DocutilsReadersPepReader;
docutilsReadersStandaloneReader?: DocutilsReadersStandaloneReader;

}
