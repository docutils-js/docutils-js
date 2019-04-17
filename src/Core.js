import readers from './Readers';
import writers from './Writers';
import { OptionParser } from './FrontEnd';
import { Source } from './Sources';
import { FileInput, FileOutput } from './io';
import Publisher from './Publisher';

export { Publisher };

export const defaultUsage = '%prog [options] [<source> [<destination>]]';
export const defaultDescription = ('Reads from <source> (default is stdin) and writes to <destination> (default is stdout).  See <http://docutils.sf.net/docs/user/config.html> for the full reference.');


export function publishCmdLine(args, cb) {
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
