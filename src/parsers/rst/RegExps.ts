export const nonWhitespaceBefore = '(?<!\\s)';
export const nonWhitespaceEscapeBefore = '(?<![\\s\\x00])';
export const nonUnescapedWhitespaceEscapeBefore = '(?<!(?<!\\x00)[\\s\\x00])';
export const nonWhitespaceAfter = '(?!\\s)';
export const classifierDelimiterRegexp = new RegExp(' +: +');
export const simpleTableBorderPat = /=+[ =]*$/;
export const gridTableTopPat = /\+-[-+]+-\+ *$/;
export const emailPattern = '%(emailc)s+(?:\\.%(emailc)s+)*(?<!\x00)@%(emailc)s+(?:\\.%(emailc)s*)*%(uri_end)s';
export const nonalphanum7bit = '[!-/:-@[-`{-~]';
export const simplename = '\\w+'; // fixme
