import Reporter from './Reporter';
import { ApplicationError } from './Exceptions';
import {DocutilsCoreOptionParser, Settings} from '../gen/Settings';
import {defaults }from "../gen/defaults";
import { ReporterInterface } from "./types";

export default function newReporter(labeled: { sourcePath: string }, settings: Settings): ReporterInterface {
    const keys = ['reportLevel', 'haltLevel', //'warningStream',
        'debug',
        'errorEncoding', 'errorEncodingErrorHandler'];
    const core: DocutilsCoreOptionParser = settings || {};
    if(typeof core !== 'undefined') {
        if (typeof core.reportLevel === 'undefined') {
            core.reportLevel = defaults.reportLevel;
        }
        if(core.haltLevel === undefined) {
            core.haltLevel = defaults.haltLevel;
        }
        if(typeof core.debug === 'undefined') {
            core.debug = defaults.debug;
        }
        if(typeof core.errorEncoding === 'undefined') {
            core.errorEncoding = defaults.errorEncoding;

        }
        if(typeof core.errorEncodingErrorHandler === 'undefined') {
            core.errorEncodingErrorHandler = defaults.errorEncodingErrorHandler;
        }

    }
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
