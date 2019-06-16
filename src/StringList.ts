import ViewList from './ViewList';
import {columnIndicies} from './utils';
import UnexpectedIndentationError from './error/UnexpectedIndentationError';
import {GetIndentedArgs} from "./types";

class StringList extends ViewList {
    // @ts-ignore
    public splice(index: number, num: number, ...elems): StringList {
        return super.splice(index, num, ...elems) as StringList;
    }

    public slice(start: number = 0, end: number = this.length): StringList {
        return super.slice(start, end) as StringList;
    }
    public constructor(
        initlist: string[],
        source?: string,
        items?: [string, number][],
        parent?: StringList,
        parentOffset?: number
    ) {
        super(initlist, source, items, parent, parentOffset);
    }

    public trimLeft(trimLength: number, start = 0, end?: number): void {
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

    public getTextBlock(start: number, flushLeft: boolean = false): StringList {
        let end = start;
        const last = this.length;
        while (end < last) {
            const line = this[end];
            if (!line.trim()) {
                break;
            }
            if (flushLeft && (line.substring(0, 1) === ' ')) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const [source, offset] = this.info(end);
                throw new UnexpectedIndentationError(this.slice(start, end) as StringList,
                    source, offset === undefined ? undefined : offset + 1);
                }
            end += 1;
        }
        return this.slice(start, end) as StringList;
    }

    public getIndented(args: GetIndentedArgs): [StringList, number, boolean] {
        const { untilBlank, stripIndent, blockIndent, firstIndent } = args;
        const cArgs = { ... args };
        if(stripIndent == null) {
            cArgs.stripIndent = true;
        }
        if (cArgs.start == null) {
            cArgs.start = 0;
        }
        let indent = blockIndent;
        let end = cArgs.start;
        if (blockIndent != null && firstIndent == null) {
            cArgs.firstIndent = blockIndent;
        }
        if (cArgs.firstIndent != null) {
            end += 1;
        }
        const last = this.length;
        let blankFinish: boolean | undefined;
        while (end < last) {
            const line = this[end];
            if (line && (line[0] !== ' ' || (blockIndent != null && line.substring(0, blockIndent).trim()))) {
                blankFinish = ((end > cArgs.start) && !this[end - 1].trim());
                break;
            }
            const stripped = line.replace(/^\s*/, '');
            if (!stripped) {
                if (untilBlank) {
                    blankFinish = true;
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
            blankFinish = true;
        }

        const block = this.slice(cArgs.start, end) as StringList;
        if (firstIndent != null && block) {
            block[0] = block[0].substring(firstIndent);
        }
        if (indent && cArgs.stripIndent) {
            //          console.log(block.constructor.name);
            block.trimLeft(indent, firstIndent != null ? 1 : 0);
        }

        return [block, indent || 0, blankFinish || false];
    }

    public get2dBlock(
        top: number,
        left: number,
        bottom: number,
        right: number,
        stripIndent: boolean = true
    ): StringList {

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
        return block as StringList;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public padDoubleWidth(arg: string): void {
        //        throw new Unimp('padDoublewidth');

    }

    public replace(old: RegExp | string, newStr: string): void {
        for (let i = 0; i < this.length; i += 1) {
            this[i] = this[i].replace(old, newStr); // fix me !!
        }
    }

    public trimTop(n = 1): void {
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
