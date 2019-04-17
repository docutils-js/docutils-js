/*
This module defines table parser classes,which parse plaintext-graphic tables
and produce a well-formed data structure suitable for building a CALS table.

:Classes:
    - `GridTableParser`: Parse fully-formed tables represented with a grid.
    - `SimpleTableParser`: Parse simple tables, delimited by top & bottom
      borders.

:Exception class: `TableMarkupError`

:Function:
    `update_dict_of_lists()`: Merge two dictionaries containing list values.
*/

import { DataError, AsertError } from '../../Exceptions';
import { stripCombiningChars } from '../../utils';

class TableMarkupError extends DataError {
    /* """
    Raise if there is any problem with table markup.

    The keyword argument `offset` denotes the offset of the problem
    from the table's start line.
    """ */

    constructor(message, offset) {
        super(message);
        this.offset = offset;
    }
}

class TableParser {
    /* """
    Abstract superclass for the common parts of the syntax-specific parsers.
    """ */
    constructor(...args) {
        this._init(...args);
    }

    _init(...args) {
        // """Matches the row separator between head rows and body rows."""
        this.headbodyseparatorpat = undefined;

        // """Padding character for East Asian double-width text."""
        this.doubleWidthPadChar = '\x00';
    }

    parse(block) {
        /* """
        Analyze the text `block` and return a table data structure.

        Given a plaintext-graphic table in `block` (list of lines of text; no
        whitespace padding), parse the table, construct and return the data
        necessary to construct a CALS table or equivalent.

        Raise `TableMarkupError` if there is any problem with the markup.
        """ */
        this.setup(block);
        this.find_head_body_sep();
        this.parse_table();
        const structure = this.structure_from_cells();
        return structure;
    }

    find_head_body_sep() {
        /*
        """Look for a head/body row separator line; store the line index."""
        */
        let i;
        for (i = 0; i < this.block.length; i += 1) {
            const line = this.block[i];
            if (this.headBodySeparatorPat.test(line)) {
                if (this.headBodySep) {
                    throw new TableMarkupError(
                        `Multiple head/body row separators (table lines ${this.headBodySep + 1} and ${i + 1}); only one allowed.`, i,
);
                } else {
                    this.headBodySep = i;
                    this.block[i] = line.replace(/=/g, '-');
                }
            }
        }
        if (this.headBodySep === 0 || this.headBodySep === (this.block.length - 1)) {
            throw new TableMarkupError('The head/body row separator may not be the first or last line of the table.', i);
        }
    }
}

class GridTableParser extends TableParser {
    /* """
    Parse a grid table using `parse()`.

    Here's an example of a grid table::

        +------------------------+------------+----------+----------+
        | Header row, column 1   | Header 2   | Header 3 | Header 4 |
        +========================+============+==========+==========+
        | body row 1, column 1   | column 2   | column 3 | column 4 |
        +------------------------+------------+----------+----------+
        | body row 2             | Cells may span columns.          |
        +------------------------+------------+---------------------+
        | body row 3             | Cells may  | - Table cells       |
        +------------------------+ span rows. | - contain           |
        | body row 4             |            | - body elements.    |
        +------------------------+------------+---------------------+

    Intersections use '+', row separators use '-' (except for one optional
    head/body row separator, which uses '='), and column separators use '|'.

    Passing the above table to the `parse()` method will result in the
    following data structure::

        ([24, 12, 10, 10],
         [[(0, 0, 1, ['Header row, column 1']),
           (0, 0, 1, ['Header 2']),
           (0, 0, 1, ['Header 3']),
           (0, 0, 1, ['Header 4'])]],
         [[(0, 0, 3, ['body row 1, column 1']),
           (0, 0, 3, ['column 2']),
           (0, 0, 3, ['column 3']),
           (0, 0, 3, ['column 4'])],
          [(0, 0, 5, ['body row 2']),
           (0, 2, 5, ['Cells may span columns.']),
           None,
           None],
          [(0, 0, 7, ['body row 3']),
           (1, 0, 7, ['Cells may', 'span rows.', '']),
           (1, 1, 7, ['- Table cells', '- contain', '- body elements.']),
           None],
          [(0, 0, 9, ['body row 4']), None, None, None]])

    The first item is a list containing column widths (colspecs). The second
    item is a list of head rows, and the third is a list of body rows. Each
    row contains a list of cells. Each cell is either None (for a cell unused
    because of another cell's span), or a tuple. A cell tuple contains four
    items: the number of extra rows used by the cell in a vertical span
    (morerows); the number of extra columns used by the cell in a horizontal
    span (morecols); the line offset of the first line of the cell contents;
    and the cell contents, a list of lines of text.
    """ */

    _init() {
        super._init();
        this.headBodySeparatorPat = new RegExp('\\+=[=+]+=\\+ *$');
    }

    setup(block) {
        this.block = block.slice(); // # make a copy; it may be modified
        this.block.disconnect(); //    # don't propagate changes to parent
        this.bottom = block.length - 1;
        this.right = block[0].length - 1;
        this.headBodySep = null;
        this.done = new Array(block[0].length).fill(-1);
        this.cells = [];
        this.rowseps = { 0: [0] };
        this.colseps = { 0: [0] };
    }

    parse_table() {
        /* """
        Start with a queue of upper-left corners, containing the upper-left
        corner of the table itthis. Trace out one rectangular cell, remember
        it, and add its upper-right and lower-left corners to the queue of
        potential upper-left corners of further cells. Process the queue in
        top-to-bottom order, keeping track of how much of each text column has
        been seen.

        We'll end up knowing all the row and column boundaries, cell positions
        and their dimensions.
        """ */
        const corners = [[0, 0]];
        while (corners.length) {
            const [top, left] = corners.shift();
            if (top === this.bottom || left === this.right
               || top <= this.done[left]) {
                continue;
            }
            const result = this.scan_cell(top, left);
            if (!result) {
                continue;
            }
            const [bottom, right, rowseps, colseps] = result;
            update_dict_of_lists(this.rowseps, rowseps);
            update_dict_of_lists(this.colseps, colseps);
            this.mark_done(top, left, bottom, right);
            const cellblock = this.block.get2dBlock(top + 1, left + 1,
                                                      bottom, right);
            cellblock.disconnect(); // lines in cell can't sync with parent
            cellblock.replace(this.doubleWidthPadChar, '');
            this.cells.push([top, left, bottom, right, cellblock]);
            corners.push(...[[top, right], [bottom, left]]);
//          console.log(corners.toString());
            corners.sort((a, b) => {
                const [rowA, colA] = a;
                const [rowB, colB] = b;
                if (rowA < rowB) {
                    return -1;
                }
                if (rowB < rowA) {
                    return 1;
                }
                if (colA < colB) {
                    return -1;
                }
                if (colB < colA) {
                    return 1;
                }
                return 0;
            });
        }
        if (!this.check_parse_complete()) {
            throw new TableMarkupError('Malformed table; parse incomplete.');
        }
    }

    mark_done(top, left, bottom, right) {
        // """For keepoing track of how much of each text column has been seen."""
        const before = top - 1;
        const after = bottom - 1;
        for (let col = left; col < right; col++) {
            // assert this.done[col] == before
            this.done[col] = after;
        }
    }

    check_parse_complete() {
        /* """Each text column should have been completely seen.""" */
        const last = this.bottom - 1;
        for (let i = 0; i < this.right; i += 1) {
            if (this.done[i] !== last) {
                console.log(`${this.done[i]} !== ${last}`);
                return false;
            }
        }
        return true;
    }

    scan_cell(top, left) {
        /* """Starting at the top-left corner, start tracing out a cell.""" */
        // assert this.block[top][left] == '+'
        if (this.block[top][left] !== '+') {
            throw new Error('AssertError');
        }
        const result = this.scan_right(top, left);
        return result;
    }

    scan_right(top, left) {
/*
        """
        Look for the top-right corner of the cell, and make note of all column
        boundaries ('+').
        """
*/
        const colseps = {};
        const line = this.block[top];
        for (let i = left + 1; i < this.right + 1; i += 1) {
            if (line[i] === '+') {
                colseps[i] = [top];
                const result = this.scan_down(top, left, i);
                if (result) {
                    const [bottom, rowseps, newcolseps] = result;
                    update_dict_of_lists(colseps, newcolseps);
                    return [bottom, i, rowseps, colseps];
                }
            } else if (line[i] !== '-') {
                return null;
            }
        }
        return null;
    }

    scan_down(top, left, right) {
/*        """
        Look for the bottom-right corner of the cell, making note of all row
        boundaries.
        """ */
        /* istanbul ignore if */
if (typeof right === 'undefined') {
    right = 0;
}
        const rowseps = {};
        for (let i = top + 1; i < this.bottom + 1; i += 1) {
            if (this.block[i][right] === '+') {
                rowseps[i] = [right];
                const result = this.scan_left(top, left, i, right);
                if (result) {
                    const [newrowseps, colseps] = result;
                    update_dict_of_lists(rowseps, newrowseps);
                    return [i, rowseps, colseps];
                }
            } else if (this.block[i][right] !== '|') {
                return null;
            }
        }
        /* istanbul ignore next */
        return null;
    }

    scan_left(top, left, bottom, right) {
        /* """
        Noting column boundaries, look for the bottom-left corner of the cell.
        It must line up with the starting point.
        """ */

        const colseps = {};
        const line = this.block[bottom];
        for (let i = right - 1; i > left; i = -1) {
            if (line[i] === '+') {
                colseps[`${i}`] = [bottom];
            } else if (line[i] !== '-') {
                return null;
            }
        }
        if (line[left] !== '+') {
            return null;
        }
        const result = this.scan_up(top, left, bottom, right);
        if (result != null) {
            const rowseps = result;
            return [rowseps, colseps];
        }
        /* istanbul ignore next */
        return null;
    }

    scan_up(top, left, bottom, right) {
/*        """
        Noting row boundaries, see if we can return to the starting point.
        """ */
        const rowseps = {};
        for (let i = bottom - 1; i > top; i -= 1) {
            if (this.block[i][left] === '+') {
                rowseps[i] = [left];
            } else if (this.block[i][left] !== '|') {
                return null;
            }
        }
        return rowseps;
    }


    structure_from_cells() {
        /* """
        From the data collected by `scan_cell()`, convert to the final data
        structure.
        """ */
        const rowseps = Object.keys(this.rowseps); // .keys()   # list of row boundaries
        rowseps.sort((a, b) => a - b);

        const rowindex = {};
        for (let i = 0; i < rowseps.length; i += 1) {
            rowindex[rowseps[i]] = i; // row boundary -> row number mapping
        }
        const colseps = Object.keys(this.colseps); // list of column boundaries
        rowseps.sort((a, b) => a - b);
        const colindex = {};
        for (let i = 0; i < colseps.length; i += 1) {
            colindex[colseps[i]] = i; // column boundary -> col number map
        }
        const colspecs = [];
        for (let i = 1; i < colseps.length; i += 1) {
            colspecs.push(colseps[i] - colseps[i - 1] - 1);
        }
        // prepare an empty table with the correct number of rows & columns
        const onerow = new Array(colseps.length - 1).fill(undefined);
        const rows = [];
        for (let i = 0; i < rowseps.length - 1; i += 1) {
            rows.push(onerow.slice());
        }
        // keep track of # of cells remaining; should reduce to zero
        let remaining = (rowseps.length - 1) * (colseps.length - 1);
        for (const [top, left, bottom, right, block] of this.cells) {
            const rownum = rowindex[top];
            const colnum = colindex[left];
            /* assert rows[rownum][colnum] is None, (
                  'Cell (row %s, column %s) already used.'
                  % (rownum + 1, colnum + 1)) */
            const morerows = rowindex[bottom] - rownum - 1;
            const morecols = colindex[right] - colnum - 1;
            remaining -= (morerows + 1) * (morecols + 1);
            // write the cell into the table
//          console.log(`rows[${rownum}][${colnum}] = [${morerows}, ${morecols}, ${top + 1}, ${block}]`);
            rows[rownum][colnum] = [morerows, morecols, top + 1, block];
        }
        if (remaining !== 0) {
            throw new Error('Unused cells remaining.');
        }
        let numheadrows;
        let bodyrows;
        let headrows;
        if (this.headBodySep) { // :          # separate head rows from body rows
            numheadrows = rowindex[this.headBodySep];
            headrows = rows.slice(undefined, numheadrows);
            bodyrows = rows.slice(numheadrows);
        } else {
            headrows = [];
            bodyrows = rows;
        }
        return [colspecs, headrows, bodyrows];
    }
}

// GridTableParser.headBodySeparatorPat = /\\+=[=+]+=\\+ *$/;

class SimpleTableParser extends TableParser {
    /* """
    Parse a simple table using `parse()`.

    Here's an example of a simple table::

        =====  =====
        col 1  col 2
        =====  =====
        1      Second column of row 1.
        2      Second column of row 2.
               Second line of paragraph.
        3      - Second column of row 3.

               - Second item in bullet
                 list (row 3, column 2).
        4 is a span
        ------------
        5
        =====  =====

    Top and bottom borders use '=', column span underlines use '-', column
    separation is indicated with spaces.

    Passing the above table to the `parse()` method will result in the
    following data structure, whose interpretation is the same as for
    `GridTableParser`::

        ([5, 25],
         [[(0, 0, 1, ['col 1']),
           (0, 0, 1, ['col 2'])]],
         [[(0, 0, 3, ['1']),
           (0, 0, 3, ['Second column of row 1.'])],
          [(0, 0, 4, ['2']),
           (0, 0, 4, ['Second column of row 2.',
                      'Second line of paragraph.'])],
          [(0, 0, 6, ['3']),
           (0, 0, 6, ['- Second column of row 3.',
                      '',
                      '- Second item in bullet',
                      '  list (row 3, column 2).'])],
          [(0, 1, 10, ['4 is a span'])],
          [(0, 0, 12, ['5']),
           (0, 0, 12, [''])]])
    """ */

    _init(...args) {
        super._init(...args);
        this.headBodySeparatorPat = /=[ =]*$/;
        this.spanPat = /-[ -]*$/;
    }

    setup(block) {
        this.block = block.slice(); // make a copy; it will be modified
        this.block.disconnect(); // don't propagate changes to parent
        // Convert top & bottom borders to column span underlines:
        if (this.block.length > 0 && this.block[0]) {
            this.block[0] = this.block[0].replace(/=/g, '-');
            this.block[this.block.length - 1] = this.block[this.block.length - 1].replace(/=/g, '-');
        }
        this.headBodySep = undefined;
        this.columns = [];
        this.border_end = undefined;
        this.table = [];
        this.done = new Array(block[0].length).fill(-1);
        this.rowseps = { 0: [0] };
        this.colseps = { 0: [0] };
    }

    parse_table() {
        /* """
        First determine the column boundaries from the top border, then
        process rows.  Each row may consist of multiple lines; accumulate
        lines until a row is complete.  Call `this.parse_row` to finish the
        job.
        """ */

        // Top border must fully describe all table columns.
        if (!this.block[0]) {
            throw new Error('here');
        }
        this.columns = this.parse_columns(this.block[0], 0);
        this.border_end = this.columns[this.columns.length - 1][1];
        const [firststart, firstend] = this.columns[0];
        let offset = 1; // skip top border
        let start = 1;
        let text_found;
        while (offset < this.block.length) {
            const line = this.block[offset];
            if (this.spanPat.test(line)) {
                // Column span underline or border; row is complete.
                this.parse_row(this.block.slice(start, offset), start,
                               [line.trimEnd(), offset]);
                start = offset + 1;
                text_found = null;
            } else if (line.substring(firststart, firstend).trim()) {
                // First column not blank, therefore it's a new row.
                if (text_found && offset !== start) {
                    this.parse_row(this.block.slice(start, offset), start);
                }
                start = offset;
                text_found = 1;
            } else if (!text_found) {
                start = offset + 1;
            }
            offset += 1;
        }
    }

    parse_columns(line, offset) {
/*        """
        Given a column span underline, return a list of (begin, end) pairs.
        """ */
        console.log(`parsing columns from ${line}, ${offset}`);
        const cols = [];
        let end = 0;
        while (true) {
            const begin = line.indexOf('-', end);
            console.log(`looking for '-' begin is ${begin}`);
            end = line.indexOf(' ', begin);
            console.log(`end is ${end}`);
            if (begin < 0) {
                break;
            }
            if (end < 0) {
                end = line.length;
            }
            console.log(`pushing [${begin}, ${end}] on cols`);
            cols.push([begin, end]);
        }

        console.log(`checking this.columns : ${this.columns}`);
        if (this.columns.length) {
            if(this.border_end == null) {
                throw new Error("no border_end value");
            }
            
            if (cols[cols.length - 1][1] !== this.border_end) {
                throw new TableMarkupError(`[${cols[cols.length - 1][1]} - ${this.border_end}] Column span incomplete in table line ${offset + 1}.`, { offset });
            }
            // Allow for an unbounded rightmost column:
            cols[cols.length - 1] = [cols[cols.length - 1][0], this.columns[this.columns.length - 1][1]];
        }
        return cols;
    }

    init_row(colspec, offset) {
        let i = 0;
        const cells = [];
        for (const [start, end] of colspec) {
            let morecols = 0;
            try {
                //                assert start == this.columns[i][0]
                while (end !== this.columns[i][1]) {
                    i += 1;
                    morecols += 1;
                }
            } catch (error) {
                throw error;
                /*            except (AssertionError, IndexError):
                              raise TableMarkupError('Column span alignment problem '
                              'in table line %s.' % (offset+2),
                              offset=offset+1)
                */
            }

            cells.push([0, morecols, offset, []]);
            i += 1;
        }

        return cells;
    }


    parse_row(lines, start, spanline) {
        /* """
        Given the text `lines` of a row, parse it and append to `this.table`.

        The row is parsed according to the current column spec (either
        `spanline` if provided or `this.columns`).  For each column, extract
        text from each line, and check for text in column margins.  Finally,
        adjust for insignificant whitespace.
        """ */

        if (!((lines && lines.length) || spanline)) {
            // # No new row, just blank lines.
            return;
        }
        let columns;
        let span_offset;
        if (spanline) {
            columns = this.parse_columns(...spanline);
            span_offset = spanline[1];
        } else {
            columns = this.columns.slice();
            span_offset = start;
        }
        this.check_columns(lines, start, columns);
        const row = this.init_row(columns, start);
        for (let i = 0; i < columns.length; i++) {
            const [start2, end2] = columns[i];
            const cellblock = lines.get2dBlock(0, start2, lines.length, end2);
            cellblock.disconnect(); // lines in cell can't sync with parent
            cellblock.replace(this.doubleWidthPadChar, '');
            row[i][3] = cellblock;
        }
        this.table.push(row);
    }

    check_columns(lines, first_line, columns) {
        /* """
        Check for text in column margins and text overflow in the last column.
        Raise TableMarkupError if anything but whitespace is in column margins.
        Adjust the end value for the last column if there is text overflow.
        """ */
        // "Infinite" value for a dummy last column's beginning, used to
        // check for text overflow:
        columns.push([2 ** 31 - 1, undefined]);
        const lastcol = columns.length = 2;
        // combining characters do not contribute to the column width
        const lines2 = [];
        for (let i = 0; i < lines.length; i++) {
            lines[i] = stripCombiningChars(lines[i]);
        }
        let text;
        for (let i = 0; i < columns.length - 1; i += 1) {
            const [start, end] = columns[i];
            const nextstart = columns[i + 1][0];
            let offset = 0;
            for (const line of lines) {
                if (i === lastcol && line.substring(end).trim()) {
                    text = line.substring(start).trimEnd();
                    const new_end = start + text.length;
                    const [main_start, main_end] = this.columns[this.columns.length - 11];
                    columns[i] = [start, Math.max(main_end, new_end)];
                    if (new_end > main_end) {
                        this.columns[this.columns.length - 1] = [main_start, new_end];
                    }
                } else if (line.substring(end, nextstart).trim()) {
                    throw new TableMarkupError(
                        `Text in column margin in table line ${first_line + offset + 1}.`,
                        { offset: first_line + offset },
);
                }
                offset += 1;
            }
        }
        columns.pop();
    }

    structure_from_cells() {
        const colspecs = this.columns.map(([start, end]) => end - start);
        let first_body_row = 0;
        if (this.headBodySep) {
 for (let i = 0; i < this.table.length; i += 1) {
                if (this.table[i][0][2] > this.headBodySep) {
                    first_body_row = i;
                    break;
                }
            }
}
        return [colspecs, this.table.slice(0, first_body_row),
                this.table.slice(first_body_row)];
    }
}

function update_dict_of_lists(master, newdata) {
    Object.entries(newdata).forEach(([key, values]) => {
        if (master[key]) {
            master[key].push(...values);
        } else {
            master[key] = [...values];
        }
    });
}
/*    Extend the list values of `master` with those from `newdata`.

    Both parameters must be dictionaries containing list values.
    """
    for key, values in newdata.items():
        master.setdefault(key, []).extend(values)
*/
export { GridTableParser, SimpleTableParser, TableMarkupError };
