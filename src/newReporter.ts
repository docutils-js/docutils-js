import Reporter from './Reporter';
import { ApplicationError } from './Exceptions';
import {DocutilsCoreOptionParser, Settings} from '../gen/Settings';
import defaults from "../gen/defaults";
import { IReporter } from "./types";

export default function newReporter(labeled: { sourcePath: string }, settings: Settings): IReporter {
    const keys = ['reportLevel', 'haltLevel', //'warningStream',
         'debug',
                  'errorEncoding', 'errorEncodingErrorHandler'];
    const core: DocutilsCoreOptionParser = settings.docutilsCoreOptionParser || {};
    if(typeof core !== 'undefined') {
        if (typeof core.reportLevel === 'undefined') {
            core.reportLevel = defaults.docutilsCoreOptionParser!.reportLevel;
        }
        if(typeof core.haltLevel === 'undefined') {
            core.haltLevel = defaults.docutilsCoreOptionParser!.haltLevel;
        }
        if(typeof core.debug === 'undefined') {
            core.debug = defaults.docutilsCoreOptionParser!.debug;
        }
        if(typeof core.errorEncoding === 'undefined') {
            core.errorEncoding = defaults.docutilsCoreOptionParser!.errorEncoding;

        }
        if(typeof core.errorEncodingErrorHandler === 'undefined') {
            core.errorEncodingErrorHandler = defaults.docutilsCoreOptionParser!.errorEncodingErrorHandler;
        }

    }
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
