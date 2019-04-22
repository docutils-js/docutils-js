/* Our original class delegates to its array,
   whereas I'm not sure an Array can be implemented without extending it
*/

import { ApplicationError } from './Exceptions';

class ViewList extends Array {
    constructor(initlist, source, items, parent, parentOffset) {
        super(...initlist);
        this.items = [];
        this.parent = parent;
        this.parentOffset = parentOffset;

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

    source(i) {
        return this.info(i)[0];
    }

    offset(i) {
        return this.info(i)[1];
    }

    disconnect() {
        this.parent = undefined;
    }

    splice(index, num, ...elems) {
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
        return new this.constructor(returnAry);
    }

    slice(start = 0, end = this.length) {
        const initList = [];

	const myEnd = Math.min(end, this.length);
        for (let i = start; i < myEnd; i += 1) {
            initList.push(this[i]);
        }
        return new this.constructor(initList);
    }

    info(i) {
        if (i === this.items.length && this.items.length > 0) {
            return [this.items[i - 1][0], null];
        }
        /* istanbul ignore if */
        if (i < 0 || i >= this.items.length) {
            throw new ApplicationError('Out of range');
        }
        return this.items[i];
    }

    trimStart(n = 1) {
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

    trimEnd(n = 1) {
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
