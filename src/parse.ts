import * as standalone from './fn/standaloneReader';
import newDocument from './newDocument';
import restParse from './fn/restructuredText';
import {Settings} from "../gen/Settings";
import {getDefaultSettings} from "./settingsHelper";

function parse(docSource: string, settings?: Settings) {
    const lSettings: Settings = settings || getDefaultSettings();
    const document = newDocument({ sourcePath: '' }, lSettings);
    if (!document.reporter) {
        throw new Error('need document reporter');
    }
    return restParse(docSource, document);
}

export default parse;
