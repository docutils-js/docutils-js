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
//    debug: true,
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
    const source = new StringInput({source: "test *em* **bold**"})
    const destination = new StringOutput({})
    const pub = new Publisher({source, destination, settings});
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

test.each([['Title', "Title\n=====\nParagraph."],
	   ['Random', '* bullet\n* bullet\n\n '],
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
	      console.log(raw);
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
		      console.log(destination.destination);
		      resolve();
		  });
	      });
	  });
						   

