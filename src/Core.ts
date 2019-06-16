import Publisher from './Publisher';
import * as defaults from './defaults';

export { Publisher };

export const defaultUsage = '%prog [options] [<source> [<destination>]]';
export const defaultDescription = ('Reads from <source> (default is stdin) and writes to <destination> (default is stdout).  See <http://docutils.sf.net/docs/user/config.html> for the full reference.');

/* We need a non command-line parsing based function */

/* We should document all the arguments to this function */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function publish(args: any): void {
    const _defaults = {
        readerName: defaults.defaultReaderName,
        parserName: defaults.defaultParserName,
        usage: defaultUsage,
        description: defaultDescription,
        enableExitStatus: defaults.defaultEnableExitStatus,
    };
    const myArgs = { ..._defaults, ...args };
    const {
        reader, readerName, parser, parserName, writer, writerName,
        settings, settingsSpec, settingsOverrides, configSection,
        enableExitStatus, argv, usage, description,
    } = myArgs;
    const pub = new Publisher({
        reader, parser, writer, settings,
    });
    pub.setComponents(readerName, parserName, writerName);
    //pub.publish2({
    //    argv, usage, description, settingsSpec, settingsOverrides, configSection, enableExitStatus,
    //});
}


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function publishCmdLine(args: any, cb: any): void {
    const _defaults = {
        readerName: 'standalone',
        parserName: 'restructuredtext',
        usage: defaultUsage,
        description: defaultDescription,
        enableExitStatus: true,
    };
    args = { ..._defaults, ...args };
    const {
        reader, readerName, parser, parserName, writer, writerName,
        settings, settingsSpec, settingsOverrides, configSection,
        enableExitStatus, argv, usage, description,
    } = args;
    const pub = new Publisher({
        reader, parser, writer, settings,
    });
    pub.setComponents(readerName, parserName, writerName);
    pub.publish({
        argv, usage, description, settingsSpec, settingsOverrides, configSection, enableExitStatus,
    }, cb);
}
