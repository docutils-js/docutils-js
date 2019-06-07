import { Settings } from './Settings';

export default defaults: Settings = {
   "docutilsReadersStandaloneReader" : {
      "docinfoXform" : 1,
      "doctitleXform" : 1
   },
   "docutilsReadersPepReader" : {},
   "docutilsWritersHtml4Css1Writer" : {
      "xmlDeclaration" : 1,
      "stylesheetPath" : [
         "html4css1.css"
      ],
      "initialHeaderLevel" : "1",
      "stylesheetDirs" : [
         ".",
         "/usr/share/docutils/writers/html4css1",
         "/usr/share/docutils/writers/html5_polyglot"
      ],
      "footnoteReferences" : "brackets",
      "template" : "/usr/share/docutils/writers/html4css1/template.txt",
      "mathOutput" : "HTML math.css",
      "attribution" : "dash",
      "tableStyle" : "",
      "optionLimit" : 14,
      "fieldNameLimit" : 14
   },
   "docutilsWritersXetexWriter" : {
      "stylesheetDirs" : [
         "."
      ],
      "hyperrefOptions" : "",
      "useVerbatimWhenPossible" : 0,
      "documentoptions" : "a4paper",
      "embedStylesheet" : 0,
      "useLatexDocinfo" : 0,
      "literalBlockEnv" : "",
      "graphicxOption" : "",
      "hyperlinkColor" : "blue",
      "usePartSection" : 0,
      "stylesheet" : "",
      "useBibtex" : null,
      "attribution" : "dash",
      "template" : "xelatex.tex",
      "documentclass" : "article",
      "tableStyle" : [
         "standard"
      ],
      "referenceLabel" : null,
      "footnoteReferences" : "superscript",
      "docutilsFootnotes" : true,
      "latexPreamble" : "% Linux Libertine (free, wide coverage, not only for Linux)\n\\setmainfont{Linux Libertine O}\n\\setsansfont{Linux Biolinum O}\n\\setmonofont[HyphenChar=None,Scale=MatchLowercase]{DejaVu Sans Mono}",
      "useLatexAbstract" : 0,
      "sectionEnumeratorSeparator" : "-"
   },
   "docutilsWritersS5HtmlWriter" : {
      "footnoteReferences" : "brackets",
      "optionLimit" : 14,
      "fieldNameLimit" : 14,
      "tableStyle" : "",
      "attribution" : "dash",
      "mathOutput" : "HTML math.css",
      "template" : "/usr/share/docutils/writers/html4css1/template.txt",
      "xmlDeclaration" : 1,
      "stylesheetPath" : [
         "html4css1.css"
      ],
      "initialHeaderLevel" : "1",
      "stylesheetDirs" : [
         ".",
         "/usr/share/docutils/writers/html4css1",
         "/usr/share/docutils/writers/html5_polyglot"
      ]
   },
   "docutilsWritersOdfOdtWriter" : {
      "addSyntaxHighlighting" : false,
      "stylesheet" : "/usr/share/docutils/writers/odf_odt/styles.odt",
      "createLinks" : false,
      "createSections" : true,
      "generateOowriterToc" : true,
      "tableBorderThickness" : null,
      "customFooter" : "",
      "cloakEmailAddresses" : false,
      "endnotesEndDoc" : false,
      "customHeader" : ""
   },
   "docutilsWritersHtml5PolyglotWriter" : {
      "initialHeaderLevel" : "1",
      "stylesheetPath" : [
         "minimal.css",
         "plain.css"
      ],
      "footnoteReferences" : "brackets",
      "tableStyle" : "",
      "attribution" : "dash",
      "mathOutput" : "HTML math.css",
      "template" : "/usr/share/docutils/writers/html5_polyglot/template.txt",
      "stylesheetDirs" : [
         ".",
         "/usr/share/docutils/writers/html5_polyglot"
      ]
   },
   "docutilsCoreOptionParser" : {
      "errorEncoding" : "UTF-8",
      "outputEncodingErrorHandler" : "strict",
      "idPrefix" : "",
      "outputEncoding" : "utf-8",
      "exitStatusLevel" : 5,
      "languageCode" : "en",
      "inputEncodingErrorHandler" : "strict",
      "errorEncodingErrorHandler" : "backslashreplace",
      "autoIdPrefix" : "id",
      "recordDependencies" : null
   },
   "docutilsWritersLatex2EWriter" : {
      "useBibtex" : null,
      "attribution" : "dash",
      "tableStyle" : [
         "standard"
      ],
      "latexPreamble" : "% PDF Standard Fonts\n\\usepackage{mathptmx} % Times\n\\usepackage[scaled=.90]{helvet}\n\\usepackage{courier}",
      "useLatexAbstract" : 0,
      "footnoteReferences" : "superscript",
      "docutilsFootnotes" : true,
      "hyperrefOptions" : "",
      "embedStylesheet" : 0,
      "documentoptions" : "a4paper",
      "useVerbatimWhenPossible" : 0,
      "useLatexDocinfo" : 0,
      "graphicxOption" : "",
      "fontEncoding" : "T1",
      "template" : "default.tex",
      "documentclass" : "article",
      "referenceLabel" : null,
      "sectionEnumeratorSeparator" : "-",
      "stylesheetDirs" : [
         "."
      ],
      "usePartSection" : 0,
      "hyperlinkColor" : "blue",
      "stylesheet" : "",
      "literalBlockEnv" : ""
   },
   "docutilsWritersPepHtmlWriter" : {
      "xmlDeclaration" : 1,
      "stylesheetPath" : [
         "html4css1.css"
      ],
      "initialHeaderLevel" : "1",
      "stylesheetDirs" : [
         ".",
         "/usr/share/docutils/writers/html4css1",
         "/usr/share/docutils/writers/html5_polyglot"
      ],
      "footnoteReferences" : "brackets",
      "template" : "/usr/share/docutils/writers/html4css1/template.txt",
      "mathOutput" : "HTML math.css",
      "attribution" : "dash",
      "tableStyle" : "",
      "optionLimit" : 14,
      "fieldNameLimit" : 14
   },
   "docutilsWritersDocutilsXmlWriter" : {
      "xmlDeclaration" : 1,
      "doctypeDeclaration" : 1
   },
   "docutilsFrontendOptionParser" : {
      "errorEncoding" : "UTF-8",
      "outputEncodingErrorHandler" : "strict",
      "idPrefix" : "",
      "outputEncoding" : "utf-8",
      "exitStatusLevel" : 5,
      "languageCode" : "en",
      "errorEncodingErrorHandler" : "backslashreplace",
      "inputEncodingErrorHandler" : "strict",
      "autoIdPrefix" : "id",
      "recordDependencies" : null
   },
   "docutilsWritersOdfOdtReader" : {
      "doctitleXform" : 1,
      "docinfoXform" : 1
   },
   "docutilsParsersRstParser" : {
      "rfcBaseUrl" : "http://tools.ietf.org/html/",
      "tabWidth" : 8,
      "smartQuotes" : false,
      "characterLevelInlineMarkup" : false,
      "pepBaseUrl" : "http://www.python.org/dev/peps/",
      "pepFileUrlTemplate" : "pep-%04d",
      "syntaxHighlight" : "long"
   }
};
