import Reporter from './Reporter';
import { ApplicationError } from './Exceptions';
import {DocutilsCoreOptionParser, Settings} from '../gen/Settings';
import { ReporterInterface, GenericSettings } from "./types";

export default function newReporter(labeled: { sourcePath: string }, settings: Settings): ReporterInterface {
    const keys = ['reportLevel', 'haltLevel', //'warningStream',
        'debug',
        'errorEncoding', 'errorEncodingErrorHandler'];
    const core: Settings = settings || {};
    const missingKeys = keys.filter((key): boolean=> !Object.prototype.hasOwnProperty.call(core, key));
    if (missingKeys.length) {
        throw new ApplicationError(`Missing required keys from settings object to instantiate reporter. Missing keys ${missingKeys.map((key): string => `"${key}"`).join(', ')}.`);
    }
    // @ts-ignore
    return new Reporter(labeled.sourcePath, core.reportLevel,
        core.haltLevel,
        core.warningStream, core.debug,
        core.errorEncoding,
        core.errorEncodingErrorHandler);
}
