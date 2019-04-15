import * as nodes from '../../nodes';

export function role(roleName, languageModule, lineno, reporter) {
    return [ (role, rawsource, text, lineno, inliner) => {
	return [[new nodes.literal(rawsource, text)], []];
    }, [] ];
}
