import { PublishCmdLineArgs } from './Core';
export const defaultDebugFlag = true;
export const __version__ = '0.15js';
export const dateDatestampFormat = "%Y-%m-%d";
export const timeAndDateDatestampFormat= "%Y-%m-%d %H:%M UTC"
export const idsAttributeName = 'ids';
export const classesAttributeName = 'classes';
export const namesAttributeName = 'names';
export const dupnamesAttributeName = 'dupnames';
export const nodeBasicAttributes = [
    idsAttributeName,
    classesAttributeName,
    namesAttributeName,
    dupnamesAttributeName,
];
export const defaultConsoleLogLevel = 'info';
export const standaloneReaderName = 'standalone';
export const restructuredtextParserName= 'restructuredtext';
export const defaultUsage = '%%prog [options] [<source> [<destination>]]';
export const defaultDescription = ('Reads from <source> (default is stdin) and writes to <destination> (default is stdout).  See <http://docutils.sf.net/docs/user/config.html> for the full reference.');

type Partial<T> = {
    [P in keyof T]?: T[P];
}

export const defaultPublisherOptions: Partial<PublishCmdLineArgs> = {
    readerName: standaloneReaderName,
    parserName: restructuredtextParserName,
    usage: defaultUsage,
    description: defaultDescription,
    enableExitStatus: true }