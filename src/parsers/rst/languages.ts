import * as en from './languages/en';
import { IRSTLanguage } from "./types";

export function getLanguage(languageCode: string): IRSTLanguage | undefined {
if(languageCode === 'en') {
return en;
}
return undefined;
}
