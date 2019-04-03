import * as utils from './utils';

test('1', () => {
    const r = utils.newReporter({}, { debug: true,
				      reportLevel: 0,
				      warningStream: {
					  write: process.stdout.write.bind(process.stdout)
				      }
				    })

//    r.attachObserver(node => {
//	console.log(node.children[0].children[0].astext());
//    })
    r.debug('hello')
})
