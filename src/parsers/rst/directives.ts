/* equivalent of docutils.parsers.rst.directives */

import * as _fallbackLanguageModule from "./languages/en";
import * as images from "./directives/images";
import * as parts from "./directives/parts";
import { ApplicationError } from "../../Exceptions";
import { Document } from "../../types";
import { RSTLanguage } from "./types";
import { escape2null, pySplit, splitEscapedWhitespace } from "../../utils";

const dirMap: any = { images, parts };

const directiveRegistry = {
      attention: ['admonitions', 'Attention'],
      caution: ['admonitions', 'Caution'],
      code: ['body', 'CodeBlock'],
      danger: ['admonitions', 'Danger'],
      error: ['admonitions', 'Error'],
      important: ['admonitions', 'Important'],
      note: ['admonitions', 'Note'],
      tip: ['admonitions', 'Tip'],
      hint: ['admonitions', 'Hint'],
      warning: ['admonitions', 'Warning'],
      admonition: ['admonitions', 'Admonition'],
      sidebar: ['body', 'Sidebar'],
      topic: ['body', 'Topic'],
      'line-block': ['body', 'LineBlock'],
      'parsed-literal': ['body', 'ParsedLiteral'],
      math: ['body', 'MathBlock'],
      rubric: ['body', 'Rubric'],
      epigraph: ['body', 'Epigraph'],
      highlights: ['body', 'Highlights'],
      'pull-quote': ['body', 'PullQuote'],
      compound: ['body', 'Compound'],
      container: ['body', 'Container'],
    // 'questions': ['body', 'question_list'],
      table: ['tables', 'RSTTable'],
      'csv-table': ['tables', 'CSVTable'],
      'list-table': ['tables', 'ListTable'],
      image: ['images', 'Image'],
      figure: ['images', 'Figure'],
      contents: ['parts', 'Contents'],
      sectnum: ['parts', 'Sectnum'],
      header: ['parts', 'Header'],
      footer: ['parts', 'Footer'],
      // 'footnotes': ['parts', 'footnotes'],
      // 'citations': ['parts', 'citations'],
      'target-notes': ['references', 'TargetNotes'],
      meta: ['html', 'Meta'],
      // 'imagemap': ['html', 'imagemap'],
      raw: ['misc', 'Raw'],
      include: ['misc', 'Include'],
      replace: ['misc', 'Replace'],
      unicode: ['misc', 'Unicode'],
      class: ['misc', 'Class'],
      role: ['misc', 'Role'],
      'default-role': ['misc', 'DefaultRole'],
      title: ['misc', 'Title'],
      date: ['misc', 'Date'],
    'restructuredtext-test-directive': ['misc', 'TestDirective'],
};

export function uri(argument: string) {
const parts = splitEscapedWhitespace(escape2null(argument));
const uri = parts.map(part => pySplit(unescape(part)).join('')).join(' ');
return uri;
}

const _directives: any = {};

function directive(directiveName: string, languageModule: RSTLanguage, document: Document) {
    const normName = directiveName.toLowerCase();
    const messages: any[] = [];
    const msgText = [];
    if (normName in _directives) {
        return [_directives[normName], messages];
    }
    let canonicalName;
    canonicalName = languageModule && languageModule.directives[normName];
    if (!canonicalName) {
        canonicalName = _fallbackLanguageModule.directives[normName];
        if (canonicalName) {
            msgText.push(`Using English fallback for directive ${directiveName}`);
        } else {
            msgText.push(`Trying "${directiveName}" as canonical directive name`);
            canonicalName = normName;
        }
    }
    if (msgText) {
        const message = document.reporter.info(msgText.join('\n'), [], { line: document.currentLine });
        messages.push(message);
    }
    if (!Object.prototype.hasOwnProperty.call(directiveRegistry, canonicalName)) {
        return [undefined, messages];
    }
    // @ts-ignore
     const [modulename, classname] = directiveRegistry[canonicalName];
    const DirectiveClass = dirMap[modulename] ? dirMap[modulename][classname] : undefined;
    _directives[normName] = DirectiveClass;
    return [DirectiveClass, messages];
}

/**
 Convert the argument into a list of ID-compatible strings and return it.
 (Directive option conversion function.)

 Raise ``ValueError`` if no argument is found.
 */
/* eslint-disable-next-line @typescript-eslint/camelcase,camelcase */
function class_option(argument: any) {
/*
    if argument is None:
        raise ValueError('argument required but none supplied')
    names = argument.split()
    class_names = []
    for name in names:
        class_name = nodes.make_id(name)
        if not class_name:
            raise ValueError('cannot make "%s" into a class name' % name)
        class_names.append(class_name)
    return class_names
    */
    return [];
}
/*
 * Directive option utility function, supplied to enable options whose
 * argument must be a member of a finite set of possible values (must be
 * lower case).  A custom conversion function must be written to use it.  For
 * example::
 *
 *     from docutils.parsers.rst import directives
 *
 *     def yesno(argument):
 *         return directives.choice(argument, ('yes', 'no'))
 *
 * Raise ``ValueError`` if no argument is found or if the argument's value is
 * not valid (not an entry in the supplied list).
 */
function choice(argument: string, values: string[]) {
    const value = argument.toLowerCase().trim();
    if (values.indexOf(value) !== -1) {
        return value;
    }
    throw new ApplicationError(`Invalid value ${argument}`);
}

export { choice, directive, class_option };
