import { Publisher, publishCmdLine, defaultDescription } from './Core'
import { Source } from './Sources';
import { StringInput, StringOutput } from './io'

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
};

test.skip('cmdline', () => {
    const description = ('Generates Docutils-native XML from standalone '+
			     'reStructuredText sources.  ' + defaultDescription)
    
    return new Promise((resolve, reject)=>{
	publishCmdLine({ debug: true,
			 debugFn: (msg) => {
			     console.log(`here ${msg}`);
			 },
			 argv: ['in.rst'], writerName: 'xml', description,
		       },
		       (error) => {
			   if(error) {
			       reject(error);
			       return;
			   }
			   resolve();
		       });
    });
});

test('1',  () => {
    const settings = { ...defaultSettings }
    const args = { ...defaultArgs }

    const { readerName, parserName, writerName } = args;
    const source = new StringInput({source: "This is a paragraph.  It's quite\n" +
		    "short.\n" +
		    "\n" +
		    "   This paragraph will result in an indented block of\n" +
		    "   text, typically used for quoting other text.\n" +
		    "\n" +
		    "This is another one."})
//    const source = new StringInput({source: 'Text 1\nText 2\n\nHeader\n======\n'})
    const destination = new StringOutput({})
    const pub = new Publisher({source, destination, settings, debug: true, debugFn: console.log});
    pub.setComponents(readerName, parserName, writerName);
    return new Promise((resolve,reject) => {
	pub.publish({}, (error, ...args) => {
	    if(error) {
		reject(error);
		return;
	    }
	    expect(destination.destination).toMatchSnapshot();
	    resolve();
	});
    });
})

test.skip.each([['Title', "Title\n=====\nParagraph."],
//	   ['Random', '* bullet\n* bullet\n\n '],
//	   ['Random 2', 'Header 1\n========\nText\n\nHeader 2\n-------'],
//	   ['Random 2', 'Test.\nTest2\nTest3\n-----'],
/*	   ['Random 4', `Test3
-----

This is a test.

* BUllet list 1
* The emacs rst editor is weird.`],*/
	   ['Emphasis', "*hello*"],
	   ['Emphasis surrounded by text', "stuff *hello* things"],
	   ['Emphasis preceded by text', "stuff *hello*"],
	   ['Emphasis followed by text', "*hello* test"],
	   ['Strong', '**hello**'],
	   ['Emphasis and inline', '*hello* and **goodbye**'],
	   ['Inline followed by emphasis', '**hello** and *goodbye*'],
	  ] )("%s", (a,raw) => {
	      const settings = { ...defaultSettings }
	      const args = { ...defaultArgs }
	      
	      const { readerName, parserName, writerName } = args;
//	      console.log(raw);
	      const source = new StringInput({source: raw});
	      const destination = new StringOutput({})
	      const pub = new Publisher({source, destination, settings});
	      pub.setComponents(readerName, parserName, writerName);
	      return new Promise((resolve, reject) => {
		  /* {argv, usage, description, settingsSpec, settingsOverrides, configSection, enableExitStatus }*/
		  pub.publish({}, (error, ...args) => {
		      if(error) {
			  reject(error);
			  return;
		      }
		      expect(destination.destination).toMatchSnapshot();
//		      console.log(destination.destination);
		      resolve();
		  });
	      });
	  });
						   

