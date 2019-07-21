require("@babel/polyfill");

const env = require('jsdoc/env');

const docutils = require('../lib/src/index');
const parse = docutils.parse;
const pojoTranslate = docutils.pojoTranslate;
const htmlTranslate = docutils.htmlTranslate;
const StackTrace = require('stacktrace-js');

const config = (env && env.conf && env.conf.restructuredtext) || {};
const defaultTags = [
    'author',
    'classdesc',
    'description',
    'exceptions',
    'params',
    'properties',
    'returns',
    'see',
    'summary',
];

const hasOwnProp = Object.prototype.hasOwnProperty;
let tags = [];
let excludeTags = [];
let handleFile = false;

function shouldProcessString(tagName, text) {
    const shouldProcess = true;
    return shouldProcess;
}

function process(doclet) {
    tags.forEach((tag) => {
        if (!hasOwnProp.call(doclet, tag)) {
            return;
        }
        if (typeof doclet[tag] === 'string' && shouldProcessString(tag, doclet[tag])) {
            console.log(`${tag}:\n---\n${doclet[tag]}\n---`);
            try {
                const document = parse(doclet[tag]);
                const r = htmlTranslate(document);
                console.log(r);
                if(typeof r === 'undefined') {
                    throw Error('bad result');
                }
                doclet[tag] = r;//'<p>' + doclet.longname + '</p><div style="border: 1px solid black">' + r + '</div>';
            } catch(e) {
                //throw e;
//                StackTrace.fromError(e).then(x => doclet[tag] = x.map((sf) => sf.toString()).join('<br>\n')).catch(e => undefined);
                doclet[tag] = StackTrace.getSync().map((sf) => sf.toString()).join('<br>\n');

            }
        } else if ( Array.isArray(doclet[tag]) ) {
            doclet[tag].forEach((value, index, original) => {
                const inner = {};

                inner[tag] = value;
                process(inner);
                original[index] = inner[tag];
            });
        } else if (doclet[tag]) {
            process(doclet[tag]);
        }
    });
}


// set up the list of "tags" (properties) to process
if (config.tags) {
    tags = config.tags.slice();
}
// set up the list of default tags to exclude from processing
if (config.excludeTags) {
    excludeTags = config.excludeTags.slice();
}
defaultTags.forEach(tag => {
    if (!excludeTags.includes(tag) && !tags.includes(tag)) {
        tags.push(tag);
    }
});


exports.defineTags = (dictionary) => {
    dictionary.defineTag('rst', { onTagged: (doclet, tag) => {
        doclet.isRest = true;
        //console.log(doclet);
    }});
};

exports.handlers = {
    newDoclet: ({ doclet }) => {
        console.log(doclet);
        if(typeof doclet.unknisRest !== 'undefined') {
            console.log(`isrest: ${doclet.isRest}`);
        }
        if(handleFile || doclet.isRest) {
            process(doclet);
        }
    },
    fileBegin: (e) => {
        handleFile = false;
    },
    symbolFound: (e) => {
        if(e.code.name === '__docformat__' && typeof e.code.value === 'string' && e.code.value.toLowerCase() == 'restructuredtext') {
            handleFile = true;
        }
    },
};
