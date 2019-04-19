=============
 Docutils-JS
=============

:Author: Kay McCormick
:Contact: kaym2038@gmail.com
:Date: Thu 18 Apr 2019 06:40:03 PM PDT
:Copyright: MIT License

.. _docutils-js GitHub repository: http://github.com/kaymccormick/docutils-js.git
.. _Docutils: http://docutils.sourceforge.net/
.. _Docutils distribution: http://docutils.sourceforge.net/#download

.. contents::
	    
Introduction
============

About the Docutils
------------------

The Docutils_ is a Python library for producing documentation based on
a text format called RST or reStructuredText. RST is used for
documenting many prominent software projects. While primarily in the
Python ecosystem, the linux kernel also uses RST for its
documentation.

About this software
-------------------

Welcome to the port of the Docutils to JavaScript. This package is
designed to enable reStructuredText (RST) processing (reading,
transforming, writing) in a JavaScript environment. It is intended to
work in a browser and in NodeJS.

Using the software
==================

1. Clone the repository with ``git``:

  ::

    $ git clone http://github.com/kaymccormick/docutils-js.git docutils-js

2. Enter the source directory:

  ::

    $ cd docutils-js

3. Install the dependencies using ``yarn``:

  ::

    $ yarn install

4. Run ``grunt`` to transpile the source code:

  ::

    $ yarn grunt

5. The output of this command should be in the ``lib`` subdirectory. Then, optionally run the tests:

  ::

    $ yarn jest

6. For now, the simplest method to use the software appears to be:

  ::

     import { Parser } from 'docutils-js/lib/parsers/restructuredtext';
     import newDocument from 'docutils-js/lib/newDocument';
     import baseSettings from 'docutils-js/lib/baseSettings';

     const p = new Parser({});
     const document = newDocument({ sourcePath: '' }, baseSettings);
     p.parse('* a bullet point', document);
     document.toString(); //   <==== this returns the xml.

..

   Using this method, a simple string can be supplied to the parse
   method, which fills the document instance with the parsed
   data. This document can be traversed, transformed, or placed in a
   backing store.

   Yes, this method is highly verbose, but is for now the simplest
   interface on offer. Contributions are welcome!

Addendum
========

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

