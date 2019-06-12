const testSource = [
    ['Title', 'Title\n=====\nParagraph.', { check: () => true }],
    ['program lang', `Want to learn about \`my favorite programming language\`_?

.. _my favorite programming language: http://www.python.org`],
    ['interpreted text with no role', '`test`'],
    ['interpreted text role prefix', ':role:`test`'],
    ['interpreted text role suffix', '`test`:role:'],
    ['interpreted text role emphasis prefix', ':emphasis:`test`'],
    ['interpreted text role emphasis suffix', '`test`:emphasis:'],
    ['interpreted text with no end string suffix', '`test'],
    ['interpreted text with both roles', ':role:`test`:role:'],
    ['Random indent', '  \n   \n \n     \n\n  \n'],
    ['Anonymous reference', '__ http://www.python.org\n'],
    ['Links', `.. _A ReStructuredText Primer: ../../user/rst/quickstart.html
.. _Quick reStructuredText: ../../user/rst/quickref.html
`],
    ['Anonymous via two dots', '.. __: http://www.python.org\n'],
    ['Inline internal targets', `* bullet list

  .. _\`second item\`:

* second item, with hyperlink target.`],
    ['Anonymous via .. no blankFinish', '.. __: http://www.python.org'],
    ['Nested sections', 'Title\n=====\n\nSection-------\n\nThird@@@@@\n\nSecond\n======\n\nOoops\n@@@@@\n'],
    ['Short overline', '===\nTitle\n===\n'],
    ['Short overline 2', '===\nTitle\n'],
    ['Incomplete title', '=====\nTitle\n', { expectError: true }],
    ['Line block with continuation line', `| Lend us a couple of bob till Thursday.
| I'm absolutely skint.
| But I'm expecting a postal order and I can pay you back
  as soon as it comes.
| Love, Ewan.`],
    ['bullet from spec', `- This is a bullet list.

- Bullets can be "*", "+", or "-".`],
    ['Bullet no unindent', '* bullet'],
    ['Nested bullets', '* bullet\n\n + bullet\n\n + bullet\n\n* bullet\n'],
    ['Transition correction', '====::\n'],
    ['Excerpt 1', `Configuration settings:
\`footnote_references <footnote_references setting_>\`_.

.. _footnote: ../doctree.html#footnote
.. _label: ../doctree.html#label
.. _footnote_references setting:
   ../../user/config.html#footnote-references-html4css1-writer

`],
    ['Mixed bullets', '* bullet\n+ bullet\n'],
    ['Transition marker', '-------\n\n'],
    ['Bullet list, invalid input', '* bullet\ninvalid'],
    ['Bullet list, invalid input line', '* bullet\n-----------'],
    ['Bullet list, invalid input field marker', '* bullet\n:Hello: foo\n'],
    ['Bullet list, invalid input doctest', '* bullet\n>>> foo\n'],
    ['Field list', `:Author: David Goodger
:Contact: docutils-develop@lists.sourceforge.net
:Revision: $Revision: 8205 $
:Date: $Date: 2017-11-27 03:07:28 -0800 (Mon, 27 Nov 2017) $
:Copyright: This document has been placed in the public domain.
`],
    ['option list', `         -a            command-line option "a"
         -b file       options can have arguments
                       and long descriptions
         --long        options can be long also
         --input=file  long options can also have
                       arguments
         /V            DOS/VMS-style options too
`],
    ['literal block', `      Literal blocks are either indented or line-prefix-quoted blocks,
      and indicated with a double-colon ("::") at the end of the
      preceding paragraph (right here -->)::

          if literal_block:
              text = 'is left as-is'
              spaces_and_linebreaks = 'are preserved'
              markup_processing = None
`],
    ['literal block without blank finish', `      Literal blocks are either indented or line-prefix-quoted blocks,
      and indicated with a double-colon ("::") at the end of the
      preceding paragraph (right here -->)::

          if literal_block:
              text = 'is left as-is'
              spaces_and_linebreaks = 'are preserved'
              markup_processing = None`],
    ['block quote', `      Block quotes consist of indented body elements:

          This theory, that is mine, is mine.

          -- Anne Elk (Miss)
`],
    ['doctest block', `      >>> print 'Python-specific usage examples; begun with ">>>"'
      Python-specific usage examples; begun with ">>>"
      >>> print '(cut and pasted from interactive Python sessions)'
      (cut and pasted from interactive Python sessions)
`],
    ['substitution definition with image', '.. |symbol here| image:: symbol.png\n'],
    ['incomplete substitution definition with image', '.. |beep'],
    ['definition list', `what
    Definition lists associate a term with a definition.

how
    The term is a one-line phrase, and the definition is one
    or more paragraphs or body elements, indented relative to
    the term.
`],
    ['definition list with classifier term', `term : classifier\n   test\n\nwhat
    Definition lists associate a term with a definition.

how
    The term is a one-line phrase, and the definition is one
    or more paragraphs or body elements, indented relative to
    the term.
`],
    ['Citation', 'Hello [Goober]_\n\n.. [Goober] Citation.\n'],
    ['Footnote', `.. [1] A footnote contains body elements, consistently
   indented by at least 3 spaces.`],
    ['Image Directive', '.. image:: mylogo.png\n'],
    ['Comment', `.. Comments begin with two dots and a space.  Anything may
   follow, except for the syntax of footnotes/citations,
   hyperlink targets, directives, or substitution definitions.`],
    ['Random', '* bullet\n* bullet\n\n '],
    ['Random 2', 'Header 1\n========\nText\n\nHeader 2\n-------'],
    ['Random 2', 'Test.\nTest2\nTest3\n-----'],
    ['Random 4', `Test3
-----

This is a test.

* BUllet list 1
* The emacs rst editor is weird.`],
    ['Emphasis', '*hello*'],
    ['Emphasis surrounded by text', 'stuff *hello* things'],
    ['Emphasis preceded by text', 'stuff *hello*'],
    ['Emphasis followed by text', '*hello* test'],
    ['Strong', '**hello**'],
    ['Emphasis and inline', '*hello* and **goodbye**'],
    ['Inline followed by emphasis', '**hello** and *goodbye*'],
    ['docutils title', '==========================================\n Docutils_ Project Documentation Overview\n==========================================\n'],
    ['Paragraph ending in ::', 'This is my paragraph ending in::\n'],
    ['more complex grid table', `+------------------------+------------+----------+----------+
| Header row, column 1   | Header 2   | Header 3 | Header 4 |
| (header rows optional) |            |          |          |
+========================+============+==========+==========+
| body row 1, column 1   | column 2   | column 3 | column 4 |
+------------------------+------------+----------+----------+
| body row 2             | Cells may span columns.          |
+------------------------+------------+---------------------+
| body row 3             | Cells may  | - Table cells       |
+------------------------+ span rows. | - contain           |
| body row 4             |            | - body elements.    |
+------------------------+------------+---------------------+`],
    ['grid table', `+------------------------+------------+----------+
| Header row, column 1   | Header 2   | Header 3 |
+========================+============+==========+
| body row 1, column 1   | column 2   | column 3 |
+------------------------+------------+----------+
| body row 2             | Cells may span        |
+------------------------+-----------------------+
`],
    ['simple table from policies.txt', `    =============  =======  ============================================
    Release Level  Label    Description
    =============  =======  ============================================
    alpha          \`\`a\`\`    Reserved for use after major experimental
                            changes, to indicate an unstable codebase.

    beta           \`\`b\`\`    Indicates active development, between releases.
                            Used with serial = 0.

    candidate      \`\`rcN\`\`  Release candidate: indicates that the
                            codebase is ready to release unless
                            significant bugs emerge.
                            Serial N starts at 1.

    final                   Indicates an official project release.
                            There is no pre-release segment for final
                            releases (no label).
    =============  =======  ============================================
`],
    ['simple table', `         ====================  ==========  ==========
         Header row, column 1  Header 2    Header 3
         ====================  ==========  ==========
         body row 1, column 1  column 2    column 3
         body row 2            Cells may span columns
         ====================  ======================
`],
    ['multilevel blockquote', `This is a top-level paragraph.

    This paragraph belongs to a first-level block quote.

        This paragraph belongs to a second-level block quote.

Another top-level paragraph.

        This paragraph belongs to a second-level block quote.

    This paragraph belongs to a first-level block quote.  The
    second-level block quote above is inside this first-level
    block quote.`],
    ['complex', `- This is the first line of a bullet list
  item's paragraph.  All lines must align
  relative to the first line.  [1]_

      This indented paragraph is interpreted
      as a block quote.

Because it is not sufficiently indented,
this paragraph does not belong to the list
item.

.. [1] Here's a footnote.  The second line is aligned
   with the beginning of the footnote label.  The ".."
   marker is what determines the indentation.
`],
    ['tabs', 'hello\ttabs\n'],
    ['footnote reference strangeness', `If [#note]_ is the first footnote reference, it will show up as
"[1]".  We can refer to it again as [#note]_ and again see
"[1]".  We can also refer to it as note_ (an ordinary internal
hyperlink reference).

.. [#note] This is the footnote labeled "note".`],
    ['footnotes multiple refs', `[#]_ is a reference to footnote 1, and [#]_ is a reference to
footnote 2.

.. [#] This is footnote 1.
.. [#] This is footnote 2.
.. [#] This is footnote 3.

[#]_ is a reference to footnote 3.`],
    ['footnote auto-symbol', `Here is a symbolic footnote reference: [*]_.

.. [*] This is the footnote.`],
    ['escaping 1', '*escape* ``with`` "\\"'],
    ['escaping 2', '\\*escape* \\``with`` "\\\\"'],
];
