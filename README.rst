Docutils-JS
===========

:Author: Kay McCormick
:Contact: kaym2038@gmail.com
:Date: Fri 26 Jul 2019 04:44:32 PM UTC
:Copyright: MIT License

.. _docutils-js GitHub repository: http://github.com/kaymccormick/docutils-typescript.git
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

Setup and configuration
=======================

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

Using the API
=============

Take a look at tools/rst2pojo.js. The API is in flux, because a
straight port of the docutils interfaces is not appropriate for a JS
API. JS does not have native IO - this is provided via the host in
some way. Node provides its own ``fs`` module, and web browsers of
course have many other ways of getting ``RST`` input, from
``XMLHttpRequest``/``fetch`` to extracting text from the current
document or a form input (e.g. ``textarea``).

Further, moving the IO responsibilities up the stack ensures that
deferred/asynchronous execution is handled outside of the docutils-js_
module itself, improving the developer experience.

Example: For now, the simplest method to use the software appears to be::

  const parse = require('../lib/index').parse;
  const PojoWriter = require('../lib/writers/pojo.js').default;
  const docSource = 'However you get your document sources'
  const document = parse(docSource);

The variable ``document`` is now ready for further processing.


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

  * Running ``rst2xml.js`` on sample documents produces documents that
    'work', sort-of, but which are significantly different from
    docutils-python output.

However, the project should be usable for people who want to
experiment, play around, or contribute through bug fixes or feature
enhancements.

