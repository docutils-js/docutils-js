import nodes from './nodes';

export const punctuation_chars = {
    openers: '"\\\'(<\\\\[{\\u0f3a\\u0f3c\\u169b\\u2045\\u207d\\u208d\\u2329\\u2768' +
           '\\u276a\\u276c\\u276e\\u2770\\u2772\\u2774\\u27c5\\u27e6\\u27e8\\u27ea' +
           '\\u27ec\\u27ee\\u2983\\u2985\\u2987\\u2989\\u298b\\u298d\\u298f\\u2991' +
           '\\u2993\\u2995\\u2997\\u29d8\\u29da\\u29fc\\u2e22\\u2e24\\u2e26\\u2e28' +
           '\\u3008\\u300a\\u300c\\u300e\\u3010\\u3014\\u3016\\u3018\\u301a\\u301d' +
           '\\u301d\\ufd3e\\ufe17\\ufe35\\ufe37\\ufe39\\ufe3b\\ufe3d\\ufe3f\\ufe41' +
           '\\ufe43\\ufe47\\ufe59\\ufe5b\\ufe5d\\uff08\\uff3b\\uff5b\\uff5f\\uff62' +
           '\\xab\\u2018\\u201c\\u2039\\u2e02\\u2e04\\u2e09\\u2e0c\\u2e1c\\u2e20' +
           '\\u201a\\u201e\\xbb\\u2019\\u201d\\u203a\\u2e03\\u2e05\\u2e0a\\u2e0d' +
        '\\u2e1d\\u2e21\\u201b\\u201f',
    closers: '"\\\')>\\\\]}\\u0f3b\\u0f3d\\u169c\\u2046\\u207e\\u208e\\u232a\\u2769' +
               '\\u276b\\u276d\\u276f\\u2771\\u2773\\u2775\\u27c6\\u27e7\\u27e9\\u27eb' +
               '\\u27ed\\u27ef\\u2984\\u2986\\u2988\\u298a\\u298c\\u298e\\u2990\\u2992' +
               '\\u2994\\u2996\\u2998\\u29d9\\u29db\\u29fd\\u2e23\\u2e25\\u2e27\\u2e29' +
               '\\u3009\\u300b\\u300d\\u300f\\u3011\\u3015\\u3017\\u3019\\u301b\\u301e' +
               '\\u301f\\ufd3f\\ufe18\\ufe36\\ufe38\\ufe3a\\ufe3c\\ufe3e\\ufe40\\ufe42' +
               '\\ufe44\\ufe48\\ufe5a\\ufe5c\\ufe5e\\uff09\\uff3d\\uff5d\\uff60\\uff63' +
               '\\xbb\\u2019\\u201d\\u203a\\u2e03\\u2e05\\u2e0a\\u2e0d\\u2e1d\\u2e21' +
               '\\u201b\\u201f\\xab\\u2018\\u201c\\u2039\\u2e02\\u2e04\\u2e09\\u2e0c' +
        '\\u2e1c\\u2e20\\u201a\\u201e'
}


export function newReporter({sourcePath}, settings) {
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
