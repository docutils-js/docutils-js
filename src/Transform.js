import * as languages from './languages';

export default class Transform  {
    constructor(document, startNode) {
	this.document = document;
	this.startNode = startNode;
	this.language = languages.getLanguage(document.settings.languageCode,
					       document.reporter);
    }
}
