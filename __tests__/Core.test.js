import { Publisher, publishCmdLine, defaultDescription } from '../src/Core';
import { Source } from '../src/Sources';
import { StringInput, StringOutput } from '../src/io';

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

test.skip('cmdline', () => {
    const description = (`${'Generates Docutils-native XML from standalone '
			     + 'reStructuredText sources.  '}${defaultDescription}`);

    return new Promise((resolve, reject) => {
	publishCmdLine({
 debug: true,
			 argv: ['in.rst'],
writerName: 'xml',
description,
		       },
		       (error) => {
			   if (error) {
			       reject(error);
			       return;
			   }
			   resolve();
		       });
    });
});

test('1', () => {
    const settings = { ...defaultSettings };
    const args = { ...defaultArgs };

    const debugLog = [];
    const debugFn = (msg) => {
	console.log(msg);
//	currentLogLines.push(msg);
    };

    const { readerName, parserName, writerName } = args;
    const source = new StringInput({ source: `==========================================
 Docutils_ Project Documentation Overview
==========================================

:Author: David Goodger
:Contact: docutils-develop@lists.sourceforge.net
:Date: $Date: 2016-01-13 13:09:13 -0800 (Wed, 13 Jan 2016) $
:Revision: $Revision: 7933 $
:Copyright: This document has been placed in the public domain.

The latest working documents may be accessed individually below, or
from the \`\`docs\`\` directory of the \`Docutils distribution\`_.

.. _Docutils: http://docutils.sourceforge.net/
.. _Docutils distribution: http://docutils.sourceforge.net/#download
` });
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
		      expect(destination.destination).toMatchSnapshot();
		      currentLogLines.length = 0;
		      resolve();
		  });
	      });
	  });
