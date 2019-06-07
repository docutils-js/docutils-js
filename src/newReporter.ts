import Reporter from './Reporter';
import { ApplicationError } from './Exceptions';
import {Settings} from '../gen/Settings';

export default function newReporter(labeled: { sourcePath: string }, settings: Settings) {
    const keys = ['reportLevel', 'haltLevel', 'warningStream', 'debug',
                  'errorEncoding', 'errorEncodingErrorHandler'];
    const core = settings.docutilsCoreOptionParser!;
    const missingKeys = keys.filter(key => !Object.prototype.hasOwnProperty.call(core, key));
    if (missingKeys.length) {
        throw new ApplicationError(`Missing required keys from settings object to instantiate reporter. Missing keys ${missingKeys.map(key => `"${key}"`).join(', ')}.`);
    }
    return new Reporter(labeled.sourcePath, core.reportLevel,
                        core.haltLevel,
                        core.warningStream, core.debug,
                        core.errorEncoding,
                        core.errorEncodingErrorHandler);
}
