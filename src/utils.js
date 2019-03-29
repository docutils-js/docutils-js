import nodes from './nodes';

function newReporter({sourcePath}, settings) {
    return new class {
	debug(msg) {
	    console.log(`debug: ${msg}`);
	}
	severe(msg) {
	    console.log(`severe: ${msg}`);
	}
	
    }
}


export function newDocument({sourcePath}, settings) {
    const reporter = newReporter({ sourcePath }, settings );
    const document = new nodes.document( settings, reporter, '', [], { source: sourcePath });
    document.noteSource(sourcePath, -1);
    return document;
}
export default {
    newDocument,
}
