import * as en from "./languages/en";
import { CoreLanguage, ReporterInterface } from "./types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getLanguage(languageCode: string, reporter: ReporterInterface): CoreLanguage | undefined {
    if(languageCode === "en") {
        return en;
    }
    return undefined;
}

