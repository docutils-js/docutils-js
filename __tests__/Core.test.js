import { Publisher, publishCmdLine, defaultDescription } from '../src/Core';
import { Source } from '../src/Sources';
import { StringInput, StringOutput } from '../src/io';
import * as nodes from '../src/nodes';

const currentLogLines = [];

afterEach(() => {
    if(currentLogLines.length) {
	console.log(currentLogLines.join('\n') + '\n');
	currentLogLines.length = 0;
    }
});

const defaultArgs = {
    readerName: 'standalone',
    parserName: 'restructuredtext',
    usage: '',
    description: '',
    enableExitStatus: true,
    writerName: 'xml',
};

const defaultSettings = {
    debug: true,
    autoIdPrefix: 'auto',
    idPrefix: '',
};

test.only('full rst2xml pipeline with specific input', () => {
    const settings = { ...defaultSettings };
    const args = { ...defaultArgs };

    const debugLog = [];
    const debugFn = (msg) => {
	console.log(msg);
//	currentLogLines.push(msg);
    };

    const { readerName, parserName, writerName } = args;
    const source = new StringInput({ source: `..
   Local Variables:
   mode: indented-text
   indent-tabs-mode: nil
   sentence-end-double-space: t
   fill-column: 70
   End:
`				      });
        const destination = new StringOutput({});
    const pub = new Publisher({
 source, destination, settings, debug: true, debugFn
});
    pub.setComponents(readerName, parserName, writerName);
    return new Promise((resolve, reject) => {
	pub.publish({}, (error, ...args) => {
	    if (error) {
		reject(error);
		return;
	    }
	    expect(destination.destination).toMatchSnapshot();
	    currentLogLines.length = 0;
	    resolve();
	});
    });
});

test.each([['Title', 'Title\n=====\nParagraph.'],
	   ['program lang',`Want to learn about \`my favorite programming language\`_?

.. _my favorite programming language: http://www.python.org`],
	   ['Random indent', '  \n   \n \n     \n\n  \n'],
	   ['Anonymous reference', '__ http://www.python.org\n'],
	   ['Links', `.. _A ReStructuredText Primer: ../../user/rst/quickstart.html
.. _Quick reStructuredText: ../../user/rst/quickref.html
`],
	  	   ['Anonymous via ..', '.. __: http://www.python.org\n'],
	   ['Anonymous via .. no blankFinish', '.. __: http://www.python.org'],
	   ['Nested sections', 'Title\n=====\n\nSection-------\n\nThird@@@@@\n\nSecond\n======\n\nOoops\n@@@@@\n'],
	   ['Short overline', '===\nTitle\n===\n'],
	   ['Short overline 2', '===\nTitle\n'],
	   ['Incomplete title', '=====\nTitle\n'],
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
	   ['substitution definition', `.. |symbol here| image:: symbol.png\n`],
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
	   ['Footnote', `.. [1] A footnote contains body elements, consistently
   indented by at least 3 spaces.`],
	   ['Image Directive', `.. image:: mylogo.png\n`],
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
	   [`complex`, `- This is the first line of a bullet list
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
	  ])('%s', (a, raw) => {
	      const settings = { ...defaultSettings };
	      const args = { ...defaultArgs };
	      const debugLog = [];
	      const debugFn = (msg) => {
		  currentLogLines.push(msg);
	      };

	      const { readerName, parserName, writerName } = args;
//	      console.log(raw);
	      const source = new StringInput({ source: raw });
	      const destination = new StringOutput({});
	      const pub = new Publisher({
		  source, destination, settings, debug: true, debugFn
});
	      pub.setComponents(readerName, parserName, writerName);
	      return new Promise((resolve, reject) => {
		  /* {argv, usage, description, settingsSpec, settingsOverrides, configSection, enableExitStatus } */
		  pub.publish({}, (error, ...args) => {
		      if (error) {
			  reject(error);
			  return;
		      }
		      const document = pub.document;
		      const Visitor = class extends nodes.GenericNodeVisitor {
			  default_departure(node) {
			      /**/
			  }
			  default_visit(node) {
			      if(node.attributes && node.attributes.refuri) {
				  console.log(node.attributes.refuri);
				  if(!/^https?:\/\//.test(node.attributes.refuri)) {
				      const msg = `Invalid refuri ${node.attributes.refuri}`;
				      const messages = [document.reporter.warning(msg, [], {})];
				      node.add(messages);
				  }
			      }
			  }
		      };
		      const visitor = new Visitor(document)
		      document.walkabout(visitor);
		      expect(destination.destination).toMatchSnapshot();
		      currentLogLines.length = 0;
		      resolve();
		  });
	      });
	  });
