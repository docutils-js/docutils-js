import Reporter from './Reporter';
import { ApplicationError } from './Exceptions';

export default function newReporter({ sourcePath }, settings) {
    const keys = ['reportLevel', 'haltLevel', 'warningStream', 'debug',
                  'errorEncoding', 'errorEncodingErrorHandler'];
    const missingKeys = keys.filter(key => !Object.prototype.hasOwnProperty.call(settings, key));
    if (missingKeys.length) {
        throw new ApplicationError(`Missing required keys from settings object to instantiate reporter. Missing keys ${missingKeys.map(key => `"${key}"`).join(', ')}.`);
    }

    return new Reporter(sourcePath, settings.reportLevel,
                        settings.haltLevel,
                        settings.warningStream, settings.debug,
                        settings.errorEncoding,
                        settings.errorEncodingErrorHandler);
}
