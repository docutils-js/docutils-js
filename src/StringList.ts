import ViewList from './ViewList';
import {columnIndicies} from './utils';
import UnexpectedIndentationError from './UnexpectedIndentationError';
import {GetIndentedArgs} from "./types";

class StringList extends ViewList {
    constructor(initlist: string[], source?: string, items?: any[], parent?: any, parentOffset?: number) {
        super(initlist, source, items, parent, parentOffset);
    }

    trimLeft(trimLength: number, start = 0, end: number) {
        let localEnd = end;
        if (localEnd === undefined) {
            localEnd = this.length;
        }
        for (let i = start; i < Math.min(localEnd, this.length); i += 1) {
            /* istanbul ignore if */
            if (typeof this[i] === 'undefined') {
                throw new Error(`${i} ${this.length}`);
            }
            this[i] = this[i].substring(trimLength);
        }
    }

    getTextBlock(start, flushLeft) {
        let end = start;
        const last = this.length;
        while (end < last) {
            const line = this[end];
            if (!line.trim()) {
                break;
            }
            if (flushLeft && (line.substring(0, 1) === ' ')) {
                const [source, offset] = this.info(end);
                throw new UnexpectedIndentationError('fixme',/*this.slice(start, end),
                                                     source, offset + 1*/);
            }
            end += 1;
        }
        return this.slice(start, end);
    }

    getIndented(args: GetIndentedArgs) {
const {  start, untilBlank, stripIndent, blockIndent, firstIndent } = args;
const cArgs = { ... args };
        if (cArgs.start == null) {
                cArgs.start = 0;
        }
        let indent = blockIndent;
        let end = start;
        if (blockIndent != null && firstIndent == null) {
            cArgs.firstIndent = blockIndent;
        }
        if (firstIndent != null) {
            end += 1;
        }
        const last = this.length;
        let blankFinish;
        while (end < last) {
            const line = this[end];
            if (line && (line[0] !== ' ' || (blockIndent != null && line.substring(0, blockIndent).trim()))) {
                blankFinish = ((end > start) && !this[end - 1].trim());
                break;
            }
            const stripped = line.replace(/^\s*/, '');
            if (!stripped) {
                if (untilBlank) {
                    blankFinish = 1;
                    break;
                }
            } else if (blockIndent == null) {
                const lineIndent = line.length - stripped.length;
                if (indent == null) {
                    indent = lineIndent;
                } else {
                    indent = Math.min(indent, lineIndent);
                }
            }
            end += 1;
        }
        if (end === last) {
            blankFinish = 1;
        }

        const block = this.slice(start, end);
        if (firstIndent != null && block) {
            block[0] = block[0].substring(firstIndent);
        }
        if (indent && stripIndent) {
//          console.log(block.constructor.name);
            block.trimLeft(indent, firstIndent != null ? 1 : 0);
        }

        return [block, indent || 0, blankFinish];
    }

    get2dBlock(top: number, left: number, bottom: number, right: number, stripIndent: boolean = true) {

        const block = this.slice(top, bottom);
        let indent = right;
        for (let i = 0; i < block.length; i += 1) {
            // get slice from line, care for combining characters
            const ci = columnIndicies(block[i]);
            if (left < 0 || left >= ci.length) {
                left += block[i].length - ci.length;
            } else {
                left = ci[left];
            }
            if (right < 0 || right >= ci.length) {
                right += block[i].length - ci.length;
            } else {
                right = ci[right];
            }
            const line = block[i].substring(left, right).trimEnd();
            block[i] = line;
            if (line) {
                indent = Math.min(indent, line.length - line.trimStart().length);
            }
        }
        if (stripIndent && (indent > 0) && (right > 0)) {
            for (let i = 0; i < block.length; i += 1) {
                block[i] = block[i].substring(indent);
            }
        }
        return block;
    }

    padDoubleWidth() {
        //        throw new Unimp('padDoublewidth');

    }

    replace(old, newStr) {
        for (let i = 0; i < this.length; i += 1) {
            this[i] = this[i].replace(old, newStr); // fix me !!
        }
    }

    trimTop(n = 1) {
        /* Remove items from the start of the list, without touching the parent. */
        /* istanbul ignore if */
        if (n > this.length) {
            throw new Error(`Size of trim too large; can't trim ${n} items `
                            + `from a list of size ${this.length}`);
        } else if (n < 0) {
            throw new Error('Trim size must be >= 0.');
        }
        this.splice(0, n);
        this.items.splice(0, n);
        if (this.parent) {
            this.parentOffset += n;
        }
    }
}
export default StringList;
