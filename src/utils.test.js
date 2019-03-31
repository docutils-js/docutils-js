import * as utils from './utils';

test('1', () => {
    const r = utils.newReporter({}, { debug: true,
				      reportLevel: 0,
				      warningStream: {
					  write: (x) => {
					      //					      conosleprocess.stdout.write.bind(process.stdout)}})
					      console.log(x);
					  }
				      }
				    })
//    r.attachObserver(node => {
//	console.log(node.children[0].children[0].astext());
//    })
    r.debug('hello')
})
