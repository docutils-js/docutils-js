import * as en from './languages/en';
import { RSTLanguage } from "./types";

export function getLanguage(languageCode: string): RSTLanguage | undefined {
    if(languageCode === 'en') {
        return en;
    }
    return undefined;
}
