/**
 *
Command-line and common processing for Docutils front-end tools.

Exports the following classes:

* `OptionParser`: Standard Docutils command-line processing.
* `Option`: Customized version of `optparse.Option`; validation support.
* `Values`: Runtime settings; objects are simple structs
  (``object.attribute``).  Supports cumulative list settings (attributes).
* `ConfigParser`: Standard Docutils config file processing.

Also exports the following functions:

* Option callbacks: `store_multiple`, `read_config_file`.
* Setting validators: `validate_encoding`,
  `validate_encoding_error_handler`,
  `validate_encoding_and_error_handler`,
  `validate_boolean`, `validate_ternary`, `validate_threshold`,
  `validate_colon_separated_string_list`,
  `validate_comma_separated_string_list`,
  `validate_dependency_file`.
* `make_paths_absolute`.
* SettingSpec manipulation: `filter_settings_spec`.
*/
import camelcase from 'camelcase';
import {ArgumentParser,ArgumentOptions,Namespace} from 'argparse';
import SettingsSpec from'./SettingsSpec';
import { SettingsSpecType, ConfigSettings, LoggerType } from './types';
import path from 'path';
import { ActionCallback } from './callback';
import { ActionValidating } from './validating';
import {  dateDatestampFormat, timeAndDateDatestampFormat } from './constants';
import { _getCallerFileAndLine } from './utils';
import { Settings } from './';
import { InvalidStateError} from './Exceptions';

export const __docformat__ = 'reStructuredText';

/*
    """Check/normalize boolean settings:
         True:  '1', 'on', 'yes', 'true'
         False: '0', 'off', 'no','false', ''
    """
*/
/**Lookup table for boolean configuration file settings.*/
const booleans: { [val: string]: boolean } = {'1': true, 'on': true,
    'yes': true, 'true': true, '0': false, 'off': false, 'no':
    false, 'false': false, '': false};

export function validateBoolean(parser: ArgumentParser, namespace: Namespace, values: any[],
    optionString: (string|null)): boolean {
    return false;
}
/*
    if isinstance(value, bool):
        return value
    try:
        return option_parser.booleans[value.strip().lower()]
    except KeyError:
        raise (LookupError('unknown boolean value: "%s"' % value),
               None, sys.exc_info()[2])
*//**
    Store multiple values in `parser.values`.  (Option callback.)

    Store `None` for each attribute named in `args`, and store the value for
    each key (attribute name) in `kwargs`.
*/
function storeMultiple(parser: ArgumentParser, namespace: Namespace, values: any[], optionString: string|null, args: any[] = [], kwargs: { [name: string]: any }  = {}) {
    args.forEach((arg: string) => {
    // @ts-ignore
        namespace[arg] = undefined;
    });
    Object.keys(kwargs).forEach((key): void => {
    // @ts-ignore
        namespace[key] = kwargs[key];
    });
}

/**     Read a configuration file during option processing.  (Option callback.) */
function readConfigFile(parser: OptionParser, namespace: Namespace, values: any[], optionString: string|null, args: any[] = [], kwargs: { [name: string]: any }  = {}) {
    let newSettings: {} | undefined;
    try {
        newSettings = parser.getConfigFileSettings(values[0]);
    } catch(error) {
        parser.error(error);
    }
    if(newSettings !== undefined) {
        Object.keys(newSettings).forEach((key): void => {
        // @ts-ignore
            namespace[key] = newSettings[key];
        });
    }
}

interface Thresholds {
    info: number;
    warning: number;
    error: number;
    severe: number;
    none: number;
}

function validateEncoding(){//setting, value, optionParser, configParser?: any, configSection?: any) {
/*    try:
        codecs.lookup(value)
    except LookupError:
        raise (LookupError('setting "%s": unknown encoding: "%s"'
                           % (setting, value)),
               None, sys.exc_info()[2])
    return value

def validate_encoding_error_handler(setting, value, option_parser,
                                    config_parser=None, config_section=None):
    try:
        codecs.lookup_error(value)
    except LookupError:
        raise (LookupError(
            'unknown encoding error handler: "%s" (choices: '
            '"strict", "ignore", "replace", "backslashreplace", '
            '"xmlcharrefreplace", and possibly others; see documentation for '
            'the Python ``codecs`` module)' % value),
               None, sys.exc_info()[2])
    return value
    */
}

/**
    Side-effect: if an error handler is included in the value, it is inserted
    into the appropriate place as if it was a separate setting/option.
*/
function validateEncodingAndErrorHandler() {
/*    if ':' in value:
        encoding, handler = value.split(':')
        validate_encoding_error_handler(
            setting + '_error_handler', handler, option_parser,
            config_parser, config_section)
        if config_parser:
            config_parser.set(config_section, setting + '_error_handler',
                              handler)
        else:
            setattr(option_parser.values, setting + '_error_handler', handler)
    else:
        encoding = value
    validate_encoding(setting, encoding, option_parser,
                      config_parser, config_section)
    return encoding
    */
}


/**
Check/normalize three-value settings:
    True:  '1', 'on', 'yes', 'true'
    False: '0', 'off', 'no','false', ''
    any other value: returned as-is.
*/
export function validateTernary(parser: ArgumentParser, namespace: Namespace, values: any[],
    optionString: (string|null)): boolean|any {
    if(typeof values[0] === 'boolean'|| values[0] === undefined) {
        return values[0];
    }
    const v = values[0].trim().toLowerCase();
    if(v in booleans) {
        return booleans[v];
    }
    return values[0];
}

function validateNonnegativeInt() { //
/*
    value = int(value)
    if value < 0:
        raise ValueError('negative value; must be positive or zero')
    return value
*/
}

function validateThreshold() {/*
    try:
        return int(value)
    except ValueError:
        try:
            return option_parser.thresholds[value.lower()]
        except (KeyError, AttributeError):
            raise (LookupError('unknown threshold: %r.' % value),
                   None, sys.exc_info[2])*/
}
/*
function validateColonSeparatedStringList(
    setting, value, option_parser, config_parser=None, config_section=None):
    if not isinstance(value, list):
        value = value.split(':')
    else:
        last = value.pop()
        value.extend(last.split(':'))
    return value

def validate_comma_separated_list(setting, value, option_parser,
                                    config_parser=None, config_section=None):
    """Check/normalize list arguments (split at "," and strip whitespace).
    """
    # `value` is already a ``list`` when  given as command line option
    # and "action" is "append" and ``unicode`` or ``str`` else.
    if not isinstance(value, list):
        value = [value]
    # this function is called for every option added to `value`
    # -> split the last item and append the result:
    last = value.pop()
    items = [i.strip(u' \t\n') for i in last.split(u',') if i.strip(u' \t\n')]
    value.extend(items)
    return value

def validate_url_trailing_slash(
    setting, value, option_parser, config_parser=None, config_section=None):
    if not value:
        return './'
    elif value.endswith('/'):
        return value
    else:
        return value + '/'

def validate_dependency_file(setting, value, option_parser,
                             config_parser=None, config_section=None):
    try:
        return docutils.utils.DependencyList(value)
    except IOError:
        return docutils.utils.DependencyList(None)

def validate_strip_class(setting, value, option_parser,
                         config_parser=None, config_section=None):
    # value is a comma separated string list:
    value = validate_comma_separated_list(setting, value, option_parser,
                                          config_parser, config_section)
    # validate list elements:
    for cls in value:
        normalized = docutils.nodes.make_id(cls)
        if cls != normalized:
            raise ValueError('Invalid class value %r (perhaps %r?)'
                             % (cls, normalized))
    return value

def validate_smartquotes_locales(setting, value, option_parser,
                         config_parser=None, config_section=None):
    """Check/normalize a comma separated list of smart quote definitions.

    Return a list of (language-tag, quotes) string tuples."""

    # value is a comma separated string list:
    value = validate_comma_separated_list(setting, value, option_parser,
                                          config_parser, config_section)
    # validate list elements
    lc_quotes = []
    for item in value:
        try:
            lang, quotes = item.split(':', 1)
        except AttributeError:
            # this function is called for every option added to `value`
            # -> ignore if already a tuple:
            lc_quotes.append(item)
            continue
        except ValueError:
            raise ValueError(u'Invalid value "%s".'
                             ' Format is "<language>:<quotes>".'
                             % item.encode('ascii', 'backslashreplace'))
        # parse colon separated string list:
        quotes = quotes.strip()
        multichar_quotes = quotes.split(':')
        if len(multichar_quotes) == 4:
            quotes = multichar_quotes
        elif len(quotes) != 4:
            raise ValueError('Invalid value "%s". Please specify 4 quotes\n'
                '    (primary open/close; secondary open/close).'
                             % item.encode('ascii', 'backslashreplace'))
        lc_quotes.append((lang,quotes))
    return lc_quotes
*/

/**
    Interpret filesystem path settings relative to the `base_path` given.

    Paths are values in `pathdict` whose keys are in `keys`.  Get `keys` from
    `OptionParser.relative_path_settings`.
*/
function makePathsAbsolute(pathdict: { [name: string]: any }, keys: string[], basePath?: string) {

    let bp = basePath!;
    if(basePath === undefined) {
        bp = process.cwd()!;
    }
    keys.forEach((key: string): void => {
        if(key in pathdict) {
            let value = pathdict[key];
            if(Array.isArray(value)) {
                value = value.map((path: string): string => makeOnePathAbsolute(bp, path));
            } else if(value !== undefined) {
                value = makeOnePathAbsolute(bp, value);
            }
            pathdict[key] = value
        }
    });
}

function makeOnePathAbsolute(basePath: string, pathArg: string) {
    return path.resolve(basePath, pathArg);
}
/*
def filter_settings_spec(settings_spec, *exclude, **replace):
    """Return a copy of `settings_spec` excluding/replacing some settings.

    `settings_spec` is a tuple of configuration settings with a structure
    described for docutils.SettingsSpec.settings_spec.

    Optional positional arguments are names of to-be-excluded settings.
    Keyword arguments are option specification replacements.
    (See the html4strict writer for an example.)
    """
    settings = list(settings_spec)
    # every third item is a sequence of option tuples
    for i in range(2, len(settings), 3):
        newopts = []
        for opt_spec in settings[i]:
            # opt_spec is ("<help>", [<option strings>], {<keyword args>})
            opt_name = [opt_string[2:].replace('-', '_')
                        for opt_string in opt_spec[1]
                            if opt_string.startswith('--')
                       ][0]
            if opt_name in exclude:
                continue
            if opt_name in replace.keys():
                newopts.append(replace[opt_name])
            else:
                newopts.append(opt_spec)
        settings[i] = tuple(newopts)
    return tuple(settings)


class Values(optparse.Values):

    """
    Updates list attributes by extension rather than by replacement.
    Works in conjunction with the `OptionParser.lists` instance attribute.
    """

    def __init__(self, *args, **kwargs):
        optparse.Values.__init__(self, *args, **kwargs)
        if (not hasattr(self, 'record_dependencies')
            or self.record_dependencies is None):
            # Set up dependency list, in case it is needed.
            self.record_dependencies = docutils.utils.DependencyList()

    def update(self, other_dict, option_parser):
        if isinstance(other_dict, Values):
            other_dict = other_dict.__dict__
        other_dict = other_dict.copy()
        for setting in option_parser.lists.keys():
            if (hasattr(self, setting) and setting in other_dict):
                value = getattr(self, setting)
                if value:
                    value += other_dict[setting]
                    del other_dict[setting]
        self._update_loose(other_dict)

    def copy(self):
        """Return a shallow copy of `self`."""
        return self.__class__(defaults=self.__dict__)


class Option(optparse.Option):

    ATTRS = optparse.Option.ATTRS + ['validator', 'overrides']

    def process(self, opt, value, values, parser):
        """
        Call the validator function on applicable settings and
        evaluate the 'overrides' option.
        Extends `optparse.Option.process`.
        """
        result = optparse.Option.process(self, opt, value, values, parser)
        setting = self.dest
        if setting:
            if self.validator:
                value = getattr(values, setting)
                try:
                    new_value = self.validator(setting, value, parser)
                except Exception, error:
                    raise (optparse.OptionValueError(
                        'Error in option "%s":\n    %s'
                        % (opt, ErrorString(error))),
                           None, sys.exc_info()[2])
                setattr(values, setting, new_value)
            if self.overrides:
                setattr(values, self.overrides, None)
        return result
*/
/**     Parser for command-line and library use.  The `settings_spec`
    specification here and in other Docutils components are merged to build
    the set of command-line options and runtime settings for this process.

    Common settings (defined below) and component-specific settings must not
    conflict.  Short options are reserved for common settings, and components
    are restrict to using long options.
*/
export interface OptionParserArgs {
    description?: string;
    usage?: string;
    readConfigFiles?: boolean;
    components?: (SettingsSpec|undefined)[];
    settingsSpecs?: SettingsSpecType[];
    defaults?: ConfigSettings;
    logger: LoggerType;
}

export class OptionParser extends ArgumentParser {
    public settingsSpec: SettingsSpecType[] = [
        [
            "General Docutils Options",
            null,
            [
                [
                    "Specify the document title as metadata.",
                    [
                        "--title"
                    ],
                    {}
                ],
                [
                    "Include a \"Generated by Docutils\" credit and link.",
                    [
                        "--generator",
                        "-g"
                    ],
                    {
                        "action": "store_true",
                        "validator": "validate_boolean"
                    }
                ],
                [
                    "Do not include a generator credit.",
                    [
                        "--no-generator"
                    ],
                    {
                        "action": "store_false",
                        "dest": "generator"
                    }
                ],
                [
                    "Include the date at the end of the document (UTC).",
                    [
                        "--date",
                        "-d"
                    ],
                    {
                        "action": "store_const",
                        "const": dateDatestampFormat,
                        "dest": "datestamp"
                    }
                ],
                [
                    "Include the time & date (UTC).",
                    [
                        "--time",
                        "-t"
                    ],
                    {
                        "action": "store_const",
                        "const": timeAndDateDatestampFormat,
                        "dest": "datestamp"
                    }
                ],
                [
                    "Do not include a datestamp of any kind.",
                    [
                        "--no-datestamp"
                    ],
                    {
                        "action": "store_const",
                        "const": null,
                        "dest": "datestamp"
                    }
                ],
                [
                    "Include a \"View document source\" link.",
                    [
                        "--source-link",
                        "-s"
                    ],
                    {
                        "action": "store_true",
                        "validator": "validate_boolean"
                    }
                ],
                [
                    "Use <URL> for a source link; implies --source-link.",
                    [
                        "--source-url"
                    ],
                    {
                        "metavar": "<URL>"
                    }
                ],
                [
                    "Do not include a \"View document source\" link.",
                    [
                        "--no-source-link"
                    ],
                    {
                        "action": "callback",
                        "callback": storeMultiple,
                        "callbackArgs": [
                            "source_link",
                            "source_url"
                        ]
                    }
                ],
                [
                    "Link from section headers to TOC entries.  (default)",
                    [
                        "--toc-entry-backlinks"
                    ],
                    {
                        "dest": "toc_backlinks",
                        "action": "store_const",
                        "const": "entry",
                        "default": "entry"
                    }
                ],
                [
                    "Link from section headers to the top of the TOC.",
                    [
                        "--toc-top-backlinks"
                    ],
                    {
                        "dest": "toc_backlinks",
                        "action": "store_const",
                        "const": "top"
                    }
                ],
                [
                    "Disable backlinks to the table of contents.",
                    [
                        "--no-toc-backlinks"
                    ],
                    {
                        "dest": "toc_backlinks",
                        "action": "store_false"
                    }
                ],
                [
                    "Link from footnotes/citations to references. (default)",
                    [
                        "--footnote-backlinks"
                    ],
                    {
                        "action": "store_true",
                        "default": 1,
                        "validator": "validate_boolean"
                    }
                ],
                [
                    "Disable backlinks from footnotes and citations.",
                    [
                        "--no-footnote-backlinks"
                    ],
                    {
                        "dest": "footnote_backlinks",
                        "action": "store_false"
                    }
                ],
                [
                    "Enable section numbering by Docutils.  (default)",
                    [
                        "--section-numbering"
                    ],
                    {
                        "action": "store_true",
                        "dest": "sectnum_xform",
                        "default": 1,
                        "validator": "validate_boolean"
                    }
                ],
                [
                    "Disable section numbering by Docutils.",
                    [
                        "--no-section-numbering"
                    ],
                    {
                        "action": "store_false",
                        "dest": "sectnum_xform"
                    }
                ],
                [
                    "Remove comment elements from the document tree.",
                    [
                        "--strip-comments"
                    ],
                    {
                        "action": "store_true",
                        "validator": "validate_boolean"
                    }
                ],
                [
                    "Leave comment elements in the document tree. (default)",
                    [
                        "--leave-comments"
                    ],
                    {
                        "action": "store_false",
                        "dest": "strip_comments"
                    }
                ],
                [
                    "Remove all elements with classes=\"<class>\" from the document tree. Warning: potentially dangerous; use with caution. (Multiple-use option.)",
                    [
                        "--strip-elements-with-class"
                    ],
                    {
                        "action": "append",
                        "dest": "strip_elements_with_classes",
                        "metavar": "<class>",
                        "validator": "validate_strip_class"
                    }
                ],
                [
                    "Remove all classes=\"<class>\" attributes from elements in the document tree. Warning: potentially dangerous; use with caution. (Multiple-use option.)",
                    [
                        "--strip-class"
                    ],
                    {
                        "action": "append",
                        "dest": "strip_classes",
                        "metavar": "<class>",
                        "validator": "validate_strip_class"
                    }
                ],
                [
                    "Report system messages at or higher than <level>: \"info\" or \"1\", \"warning\"/\"2\" (default), \"error\"/\"3\", \"severe\"/\"4\", \"none\"/\"5\"",
                    [
                        "--report",
                        "-r"
                    ],
                    {
                        "choices": [
                            "info",
                            "1",
                            "warning",
                            "2",
                            "error",
                            "3",
                            "severe",
                            "4",
                            "none",
                            "5"
                        ],
                        "default": 2,
                        "dest": "report_level",
                        "metavar": "<level>",
                        "validator": "validate_threshold"
                    }
                ],
                [
                    "Report all system messages.  (Same as \"--report=1\".)",
                    [
                        "--verbose",
                        "-v"
                    ],
                    {
                        "action": "store_const",
                        "const": 1,
                        "dest": "report_level"
                    }
                ],
                [
                    "Report no system messages.  (Same as \"--report=5\".)",
                    [
                        "--quiet",
                        "-q"
                    ],
                    {
                        "action": "store_const",
                        "const": 5,
                        "dest": "report_level"
                    }
                ],
                [
                    "Halt execution at system messages at or above <level>.  Levels as in --report.  Default: 4 (severe).",
                    [
                        "--halt"
                    ],
                    {
                        "choices": [
                            "info",
                            "1",
                            "warning",
                            "2",
                            "error",
                            "3",
                            "severe",
                            "4",
                            "none",
                            "5"
                        ],
                        "dest": "halt_level",
                        "default": 4,
                        "metavar": "<level>",
                        "validator": "validate_threshold"
                    }
                ],
                [
                    "Halt at the slightest problem.  Same as \"--halt=info\".",
                    [
                        "--strict"
                    ],
                    {
                        "action": "store_const",
                        "const": 1,
                        "dest": "halt_level"
                    }
                ],
                [
                    "Enable a non-zero exit status for non-halting system messages at or above <level>.  Default: 5 (disabled).",
                    [
                        "--exit-status"
                    ],
                    {
                        "choices": [
                            "info",
                            "1",
                            "warning",
                            "2",
                            "error",
                            "3",
                            "severe",
                            "4",
                            "none",
                            "5"
                        ],
                        "dest": "exit_status_level",
                        "default": 5,
                        "metavar": "<level>",
                        "validator": "validate_threshold"
                    }
                ],
                [
                    "Enable debug-level system messages and diagnostics.",
                    [
                        "--debug"
                    ],
                    {
                        "action": "store_true",
                        "validator": "validate_boolean"
                    }
                ],
                [
                    "Disable debug output.  (default)",
                    [
                        "--no-debug"
                    ],
                    {
                        "action": "store_false",
                        "dest": "debug"
                    }
                ],
                [
                    "Send the output of system messages to <file>.",
                    [
                        "--warnings"
                    ],
                    {
                        "dest": "warning_stream",
                        "metavar": "<file>"
                    }
                ],
                [
                    "Enable Javascript tracebacks when Docutils is halted.",
                    [
                        "--traceback"
                    ],
                    {
                        "action": "store_true",
                        "default": null,
                        "validator": "validate_boolean"
                    }
                ],
                [
                    "Disable Python tracebacks.  (default)",
                    [
                        "--no-traceback"
                    ],
                    {
                        "dest": "traceback",
                        "action": "store_false"
                    }
                ],
                [
                    "Specify the encoding and optionally the error handler of input text.  Default: <locale-dependent>:strict.",
                    [
                        "--input-encoding",
                        "-i"
                    ],
                    {
                        "metavar": "<name[:handler]>",
                        "validator": "validate_encoding_and_error_handler"
                    }
                ],
                [
                    "Specify the error handler for undecodable characters.  Choices: \"strict\" (default), \"ignore\", and \"replace\".",
                    [
                        "--input-encoding-error-handler"
                    ],
                    {
                        "default": "strict",
                        "validator": "validate_encoding_error_handler"
                    }
                ],
                [
                    "Specify the text encoding and optionally the error handler for output.  Default: UTF-8:strict.",
                    [
                        "--output-encoding",
                        "-o"
                    ],
                    {
                        "metavar": "<name[:handler]>",
                        "default": "utf-8",
                        "validator": "validate_encoding_and_error_handler"
                    }
                ],
                [
                    "Specify error handler for unencodable output characters; \"strict\" (default), \"ignore\", \"replace\", \"xmlcharrefreplace\", \"backslashreplace\".",
                    [
                        "--output-encoding-error-handler"
                    ],
                    {
                        "default": "strict",
                        "validator": "validate_encoding_error_handler"
                    }
                ],
                [
                    "Specify text encoding and error handler for error output.  Default: UTF-8:backslashreplace.",
                    [
                        "--error-encoding",
                        "-e"
                    ],
                    {
                        "metavar": "<name[:handler]>",
                        "default": "UTF-8",
                        "validator": "validate_encoding_and_error_handler"
                    }
                ],
                [
                    "Specify the error handler for unencodable characters in error output.  Default: backslashreplace.",
                    [
                        "--error-encoding-error-handler"
                    ],
                    {
                        "default": "backslashreplace",
                        "validator": "validate_encoding_error_handler"
                    }
                ],
                [
                    "Specify the language (as BCP 47 language tag).  Default: en.",
                    [
                        "--language",
                        "-l"
                    ],
                    {
                        "dest": "language_code",
                        "default": "en",
                        "metavar": "<name>"
                    }
                ],
                [
                    "Write output file dependencies to <file>.",
                    [
                        "--record-dependencies"
                    ],
                    {
                        "metavar": "<file>",
                        "validator": "validate_dependency_file",
                        "default": null
                    }
                ],
                /*
                [
                    "Read configuration settings from <file>, if it exists.",
                    [
                        "--config"
                    ],
                    {
                        "metavar": "<file>",
                        "type": "string",
                        "action": "callback",
                        "callback": readConfigFile
                    }
                ],
                */
                [
                    "Show this program's version number and exit.",
                    [
                        "--version",
                        "-V"
                    ],
                    {
                        "action": "version"
                    }
                ],
                [
                    "Show this help message and exit.",
                    [
                        "--help",
                        "-h"
                    ],
                    {
                        "action": "help"
                    }
                ],
                [
                    "SUPPRESSHELP",
                    [
                        "--id-prefix"
                    ],
                    {
                        "default": ""
                    }
                ],
                [
                    "SUPPRESSHELP",
                    [
                        "--auto-id-prefix"
                    ],
                    {
                        "default": "id"
                    }
                ],
                [
                    "SUPPRESSHELP",
                    [
                        "--dump-settings"
                    ],
                    {
                        "action": "store_true"
                    }
                ],
                [
                    "SUPPRESSHELP",
                    [
                        "--dump-internals"
                    ],
                    {
                        "action": "store_true"
                    }
                ],
                [
                    "SUPPRESSHELP",
                    [
                        "--dump-transforms"
                    ],
                    {
                        "action": "store_true"
                    }
                ],
                [
                    "SUPPRESSHELP",
                    [
                        "--dump-pseudo-xml"
                    ],
                    {
                        "action": "store_true"
                    }
                ],
                [
                    "SUPPRESSHELP",
                    [
                        "--expose-internal-attribute"
                    ],
                    {
                        "action": "append",
                        "dest": "expose_internals",
                        "validator": "validate_colon_separated_string_list"
                    }
                ],
                [
                    "SUPPRESSHELP",
                    [
                        "--strict-visitor"
                    ],
                    {
                        "action": "store_true"
                    }
                ]
            ]
        ]
    ];

    public configSectionDependencies: string[] = [];
    public version?: string;
    public configFiles: string[]=[];
    public lists: {};
    public defaults: ConfigSettings = {};
    /** Docutils configuration files, using ConfigParser syntax.  Filenames
     * will be tilde-expanded later.  Later files override earlier ones.
     */
    public standardConfigFiles: string[] = [
        '/etc/docutils.conf',           // system-wide
        './docutils.conf',              // project-specific
        '~/.docutils'];                  // user-specific

    /** Possible inputs for for --report and --halt threshold values. */
    public thresholdChoices: string[] = ['info', '1',
        'warning', '2',
        'error', '3',
        'severe', '4',
        'none', '5'];

    /**Lookup table for --report and --halt threshold values.*/
    public thresholds: Thresholds = {
        'info': 1,
        'warning': 2,
        'error': 3,
        'severe': 4,
        'none': 5,
    }

    public defaultErrorEncoding = '';/*getattr(sys.stderr, 'encoding', None) or locale_encoding or 'ascii'*/

    public defaultErrorEncodingErrorHandler = 'backslashreplace'


    /**
    Defaults for settings that don't have command-line option equivalents. */
    settingsDefaults: { [propName: string]: any|undefined } =
    {'_disableConfig': undefined,
        '_source': undefined,
        '_destination': undefined,
        '_configFiles': undefined}

    public relativePathSettings: string[] = ['warning_stream'];

    public configSection = 'general'

    public components: (SettingsSpec|undefined)[] = [];

    /** Default version message. */
    public versionTemplate = '';
    private logger: LoggerType;

    public constructor(args: OptionParserArgs) {
        super({usage: args.usage, description: args.description});
        this.logger = args.logger;
        // @ts-ignore
        this.register('action', 'callback', ActionCallback);
        // @ts-ignore
        this.register('action', 'validating', ActionValidating);

        /** Set of list-type settings. */
        this.lists = {}

        /** List of paths of applied configuration files. */
        this.configFiles = []

        const argParser= new ArgumentParser({description: args.description});
        if(!this.version) {
            // is this correct?
            this.version = this.versionTemplate;
        }
        // Make an instance copy (it will be modified): ??
        this.relativePathSettings = [...this.relativePathSettings];
        this.logger.silly('constructing component list');
        this.logger.silly(`adding 'this' to component list`);
        this.components = [this];
        if(args && args.components) {
	  this.logger.silly(`tacking on supplied components: ${args.components.map(c=>c !== undefined ? c.toString() : 'undefined').join(', ')}`);
            if(args.components.indexOf(undefined) !== -1) {
                throw new InvalidStateError('received undefined component');
            }

	  this.components.push(...args.components);
	  }

        this.populateFromComponents(this.components)
        this.setDefaultsFromDict(args.defaults || {})
        if(args.readConfigFiles && !this.defaults._disableConfig) {
            let configSettings;
            try {
                configSettings = this.getStandardConfigSettings();
            } catch(error) {
                throw error; //except ValueError, error: self.error(SafeString(error))
            }
            this.setDefaultsFromDict(configSettings);
        }
    }

    /**
     *  For each component, first populate from the `SettingsSpec.settings_spec`
     *  structure, then from the `SettingsSpec.settingsDefaults` dictionary.
     *  After all components have been processed, check for and populate from
     *  each component's `SettingsSpec.settingsDefaultOverrides` dictionary.
     */
    public populateFromComponents(components: (SettingsSpec|undefined)[]) {
        this.logger.silly('Frontend.populateFromComponents', { callerInfo: _getCallerFileAndLine() });
        components.forEach((component) => {
            if(!component || !component.settingsSpec) {
                this.logger.silly('component undefined');
                return;
            }
	    this.logger.silly(`component is ${component.toString()} ${component.constructor.name}`);
            const settingsSpec = component.settingsSpec!;
            this.relativePathSettings.push(...component.relativePathSettings);
            settingsSpec.forEach((spec: SettingsSpecType) => {
                const [ title, description, optionSpec ] = spec;
                optionSpec.forEach(([helpText, optionStrings, optionArgs]) => {
                    if(optionStrings.indexOf('--help') !== -1) {
                    } else {
                        const help = helpText.replace(/%/g, '%%');
                        let action;
                        let newArgs: {[name: string]: any} = { help };
                        if(Object.prototype.hasOwnProperty.call(optionArgs, 'dest')) {
                            let dest = camelcase(optionArgs.dest, { pascalCase: false });
                            newArgs.dest = dest;
                        } else {
                            newArgs.dest= camelcase(optionStrings[0], { pascalCase: false });}

                        if(Object.prototype.hasOwnProperty.call(optionArgs, 'default')) {
                            newArgs.defaultValue = optionArgs['default'];
                        }
                        let a = '';
                        if(Object.prototype.hasOwnProperty.call(optionArgs, 'action')) {
                            a = optionArgs.action;
                        }
                        if(a === 'store_const') {
                            action = 'storeConst';
                            newArgs.constant = optionArgs.const;
                        } else if(a === 'store_true') {
                            action = 'storeTrue';
                            //             newArgs.nargs = 0;
                        } else if(a === 'append') {
                            action = 'append';
                        } else if(a === 'store_false') {
                            action = 'storeFalse';
                            //             newArgs.nargs = 0;
                        } else if(a === 'append') {
                            action = a;
                        } else if(a === 'version') {
                            action = a;
                        } else if(a === 'callback') {
                            action = 'callback';
                            newArgs.callback = optionArgs.callback;
                            newArgs.callbackArgs = optionArgs.callbackArgs;
                            newArgs.nargs = 0;
                        } else if(a === 'version') {
                            action = 'version';
			    } else if(a === 'validating') {
			    action = 'validating';
			    newArgs.nargs = optionArgs.nargs,
			    newArgs.validator = optionArgs.validator;
			    newArgs.delegatedAction = optionArgs.delegatedAction;
                        } else {
                            action = 'store';
                        }
                        newArgs.action = action;
                        this.addArgument(optionStrings, newArgs);
                    }
                });
            });
            if(component.settingsDefaults) {
	        this.logger.silly('updating defaults from component.settingsDefaults');

	        Object.keys(component.settingsDefaults).forEach((key): void => {
		   this.logger.silly(`setting default for ${key} is ${component.settingsDefaults[key]}`);
                    this.defaults[key] = component.settingsDefaults[key];
                });
            }
        });
    }

    /*
        for component in components:
            if component and component.settings_default_overrides:
                self.defaults.update(component.settings_default_overrides)*/


    /** Return list of config files, from environment or standard. */
    public getStandardConfigFiles(): string[] {
        const configFiles = this.standardConfigFiles;
        return configFiles;
    }

    public getStandardConfigSettings(): ConfigSettings {
        /*
        settings = Values()
        for filename in self.get_standard_config_files():
            settings.update(self.get_config_file_settings(filename), self)
        return settings
        */
        return {}
    }

    /** Returns a dictionary containing appropriate config file settings. */
    public getConfigFileSettings(configFile: string): {} {
        return {};
        /*        parser = ConfigParser()
        parser.read(config_file, self)
        self.configFiles.extend(parser._files)
        base_path = os.path.dirname(config_file)
        applied = {}
        settings = Values()
        for component in self.components:
            if not component:
                continue
            for section in (tuple(component.config_section_dependencies or ())
                            + (component.config_section,)):
                if section in applied:
                    continue
                applied[section] = 1
                settings.update(parser.get_section(section), self)
        make_paths_absolute(
            settings.__dict__, self.relative_path_settings, base_path)
        return settings.__dict__
        */
    }

    /** Store positional arguments as runtime settings. */
    public checkValues(values: ConfigSettings, args: string[]): ConfigSettings {
        this.logger.silly('checkValues');
        [ values._source, values._destination ] = this.checkArgs(args);
        this.logger.silly('source and dest', { source: values._source, destination: values._destination });

        //makePathsAbsolute(values, this.relativePathSettings);
        values._configFiles = this.configFiles;
        return values;
    }

    public checkArgs(args: string[]): [string?, string?] {
        let source;
        let destination;
        if(args.length) {
            source = args.shift();
            if(source === '-') { // means stdin
                source = undefined;
            }
        }
        if(args.length) {
            destination = args.shift()
            if(destination === '-') { //  means stdout
                destination = undefined;
            }
        }
        if(args.length) {
            this.error('Maximum 2 arguments allowed.');
        }
        if(source && source === destination) {
            this.error('Do not specify the same file for both source and '+
                       'destination.  It will clobber the source file.');
        }
        return [source, destination];
    }
    public setDefaultsFromDict(defaults: ConfigSettings) {
        Object.keys(defaults).forEach((key): void => {
            this.defaults[key] = defaults[key];
        });
    }

    public  getDefaultValues(): Settings{
        const defaults = this.defaults;
        defaults._configFiles = this.configFiles;
        return defaults;
    }

    /**
      * Get an option by its dest.
      *
      * If you're supplying a dest which is shared by several options,
      * it is undefined which option of those is returned.
      *
      * A KeyError is raised if there is no option with the supplied
      * dest.
      **/
    public getOptionByDest(dest: string): ArgumentOptions {
        throw new Error('unimplemented');
        /*        for group in self.optionGroups + [self]:
            for option in group.option_list:
                if option.dest == dest:
                    return option
        raise KeyError('No option with dest == %r.' % dest)
        */
    }

    public toString(): string {
        return '<Frontend.OptionParser>';
    }
}
