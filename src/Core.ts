import {Publisher} from './Publisher';
import { ConfigSettings, SettingsSpecType, LoggerType } from './types';
import Writer from './Writer';
import Parser from './Parser';
import Reader from './Reader';
import { Settings } from '../gen/Settings';
import { defaultPublisherOptions, defaultUsage, defaultDescription } from './constants';
export { Publisher };

/* We need a non command-line parsing based function */

/* We should document all the arguments to this function */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function publish(args: any): void {
    const myArgs = { ...defaultPublisherOptions, ...args };
    const {
        reader, readerName, parser, parserName, writer, writerName,
        settings,
    } = myArgs;
    const pub = new Publisher({
        reader, parser, writer, settings, logger:myArgs.logger,
    });
    pub.setComponents(readerName, parserName, writerName);
}


export interface PublishCmdLineArgs {
    reader?: Reader;
    readerName?: string;
    parser?: Parser;
    parserName?: string;
    writer?: Writer;
    writerName?: string;
    settings?: Settings;
    settingsSpec?: SettingsSpecType[];
    settingsOverrides?: ConfigSettings;
    configSection?: string;
    enableExitStatus?: boolean;
    argv?: string[];
    usage?: string;
    description?: string;
    logger: LoggerType;
}

/**
 *  Set up & run a `Publisher` for command-line-based file I/O (input and
 *  output file paths taken automatically from the command line).  Return the
 *  encoded string output also.
 *
 *  Parameters: see `publish_programmatically` for the remainder.
 *
 *  - `argv`: Command-line argument list to use instead of ``sys.argv[1:]``.
 *  - `usage`: Usage string, output if there's a problem parsing the command
 *    line.
 *  - `description`: Program description, output for the "--help" option
 *    (along with command-line option descriptions).
 *
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function publishCmdLine(args: PublishCmdLineArgs, cb: any): void {
    const _defaults = {
        readerName: 'standalone',
        parserName: 'restructuredtext',
        usage: defaultUsage,
        description: defaultDescription,
        enableExitStatus: true,
    };
    args = { ..._defaults, ...args };
    args.logger.silly('publishCmdLine');
    const {
        reader, readerName, parser, parserName, writer, writerName,
        settings, settingsSpec, settingsOverrides, configSection,
        enableExitStatus, argv, usage, description,
    } = args;
    const pub = new Publisher({
        reader, parser, writer, settings, logger:args.logger,
    });
    pub.setComponents(readerName, parserName, writerName);
    pub.publish({
        argv, usage, description, settingsSpec, settingsOverrides, configSection, enableExitStatus,
    }, cb);
}
