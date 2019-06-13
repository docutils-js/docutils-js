/* Our original class delegates to its array,
   whereas I'm not sure an Array can be implemented without extending it
*/

import { ApplicationError } from './Exceptions';

class ViewList extends Array {
    public items: [string | undefined, number | undefined][];

    protected parentOffset: number;

    public parent?: ViewList;

    public constructor(
        initlist: {}[] = [],
        source?: string,
        items?: [string, number][],
        parent?: ViewList,
        parentOffset?: number
    ) {
        // @ts-ignore
        super(...initlist);
        this.items = [];
        this.parent = parent;
        this.parentOffset = parentOffset || 0;

        if (initlist instanceof ViewList) {
            //          this.data = [...initlist.data]
            this.items = [...initlist.items];
        } else if (initlist) {
            //          this.data = [...initlist]
            if (items) {
                this.items = items;
            } else {
                this.items = [];
                for (let i = 0; i < initlist.length; i += 1) {
                    this.items.push([source, i]);
                }
            }
        }
    }

    public source(i: number): string | undefined {
        return this.info(i)[0];
    }

    public offset(i: number): number | undefined {
        return this.info(i)[1];
    }

    public disconnect(): void {
        this.parent = undefined;
    }

    public splice(index: number, num: number, ...elems: {}[]): ViewList {
        //        console.log(`enter slice ${index} ${num} [${elems.length}]`);
        //        console.log(`input: ${JSON.stringify(this)}`);
        const returnAry = [];
        for (let i = index; i < this.length - num; i += 1) {
            if (i < index + num) {
                returnAry.push(this[i]);
            }
            //            console.log(`setting this[${i}] to this[${i + num}]`);
            this[i] = this[i + num];
        }
        //        console.log(`setting length to ${this.length - num}`);
        this.length = this.length - num;
        this.push(...elems);
        //        console.log(`returning ${JSON.stringify(returnAry)}`);
        // @ts-ignore
        return new this.constructor(returnAry);
    }

    public slice(start = 0, end = this.length): ViewList {
        const initList = [];

        const myEnd = Math.min(end, this.length);
        for (let i = start; i < myEnd; i += 1) {
            initList.push(this[i]);
        }
        // @ts-ignore
        return new this.constructor(initList);
    }

    public info(i: number): [string | undefined, number | undefined] {
        if (i === this.items.length && this.items.length > 0) {
            return [this.items[i - 1][0], undefined];
        }
        /* istanbul ignore if */
        if (i < 0 || i >= this.items.length) {
            throw new ApplicationError('Out of range');
        }
        return this.items[i];
    }

    public trimStart(n = 1): void {
        /* istanbul ignore if */
        if (n > this.length) {
            // fixme
            // raise IndexError("Size of trim too large; can't trim %s items "
            //               "from a list of size %s." % (n, len(self.data)))
        } else if (n < 0) {
            throw Error('Trim size must be >= 0.');
        }
        for (let i = 0; i < n; i += 1) {
            this.shift();
        }
        if (this.parent) {
            this.parentOffset += n;
        }
    }

    public trimEnd(n = 1): void {
        /* Remove items from the end of the list, without touching the parent. */
        /*        if n > len(self.data):
            raise IndexError("Size of trim too large; can't trim %s items "
                             "from a list of size %s." % (n, len(self.data)))
        elif n < 0:
            raise IndexError('Trim size must be >= 0.')
*/
        for (let i = 0; i < n; i += 1) {
            this.pop();
            this.items.pop();
        }
    }
}

export default ViewList;
