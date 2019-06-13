import newDocument from './newDocument';
import restParse from './fn/restructuredText';
import {Settings} from "../gen/Settings";
import {getDefaultSettings} from "./settingsHelper";
import { Document } from "./types";

function parse(docSource: string, settings?: Settings): Document {
    const lSettings: Settings = settings || getDefaultSettings();
    const document = newDocument({ sourcePath: '' }, lSettings);
    if (!document.reporter) {
        throw new Error('need document reporter');
    }
    return restParse(docSource, document);
}

export { parse };
export default parse;
