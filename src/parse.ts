import newDocument from './newDocument';
import restParse from './fn/restructuredText';
import {Settings} from "../gen/Settings";
import {getDefaultSettings} from "./settingsHelper";
import { Document, LoggerType } from "./types";
import baseSettings from '../src/baseSettings';

/**
 * Parse a REST document. This function uses getDefaualtSettings if settings parameter
 * is undefined.
 */
function parse(
    docSource: string,
    logger: LoggerType,
    settings?: Settings,
): Document {
    const lSettings: Settings = settings || { ...baseSettings };
    const document = newDocument({ logger, sourcePath: '' }, lSettings);
    return restParse(docSource, document, logger);
}

export { parse };
export default parse;
