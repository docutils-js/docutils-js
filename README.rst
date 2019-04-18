Docutils JS port
================

Welcome to the port of Docutils, originally in Python, to
JavaScript. This package is designed to enable reStructuredText (RST)
processing (reading, transforming, writing) in a JavaScript
environment. It is intended to work in a browser and in NodeJS.

The only currently existing tool is rst2xml.js in the tools
subdirectory. It runs off of babel-transpiled code, so be sure to run
'grunt' to generate the transpiled code in the lib subdirectory. Then,
rst2xml.js can accept a single parameter indicating the input file. It
is a very rough and bare implementation, since for now I've decided
not to implement all of the various command line processing code.

However, rst2xml.js can help to see how the Docutils-JS is processing
a document and whether it does so correctly.

Remaining to be implemented:

  * Transformers (output is not currently processed as docutils would)

  * Directives (there are a couple of no-op directives in place, such as image
    and contents.

There are currently quite a number of bugs.

  * Problems with sections

  * Problems with tables

  * Lack of transformers and directives

  * Running rst2xml.js on sample documents produces documents that
    'work', sort-of, but which are significantly different from
    docutils-python output.

 However, the project should be usable for people who want to
 experiment, play around, or contribute through bug fixes or feature
 enhancements.
