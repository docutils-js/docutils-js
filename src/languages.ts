import { IRSTLanguage } from "./parsers/rst/types";
import * as en from './languages/en'
import { IReporter } from "./types";

interface IBaseLanguage {
  labels: any;
  bibliographicFields: any;
  authorSeparators: string[];
}

export function getLanguage(languageCode: string, reporter: IReporter): IBaseLanguage | undefined {
  if(languageCode === "en") {
    return en;
  }
  return undefined;
}

