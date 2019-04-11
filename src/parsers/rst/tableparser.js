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

import { DataError } from '../../Exceptions';
import { strip_combining_chars } from '../../utils';

export class TableMarkupError extends DataError {
    /*"""
    Raise if there is any problem with table markup.

    The keyword argument `offset` denotes the offset of the problem
    from the table's start line.
    """*/

    constructor(message, offset) {
	super(message);
	this.offset = offset;
    }
}

class TableParser {
    /*"""
    Abstract superclass for the common parts of the syntax-specific parsers.
    """*/

    _init() {
	this.head_body_separator_pat = None
	//"""Matches the row separator between head rows and body rows."""

	this.double_width_pad_char = '\x00'
	//"""Padding character for East Asian double-width text."""
    }

    parse(block) {
        /*"""
        Analyze the text `block` and return a table data structure.

        Given a plaintext-graphic table in `block` (list of lines of text; no
        whitespace padding), parse the table, construct and return the data
        necessary to construct a CALS table or equivalent.

        Raise `TableMarkupError` if there is any problem with the markup.
        """*/
        this.setup(block)
        this.find_head_body_sep()
        this.parse_table()
        const structure = this.structure_from_cells()
        return structure
    }

    find_head_body_sep() {
	/*
        """Look for a head/body row separator line; store the line index."""
	for(let i  = 0; i < this.block.length; i += 1) {
	const line = this.block[i]
        if(this.head_body_separator_pat.exec(line)) {
                if(this.head_body_sep) {
                    throw new TableMarkupError(
                        `Multiple head/body row separators (table lines ${this.head_body_sep+1} and ${i+1}); only one allowed.`, { offset: i
                else:
                    this.head_body_sep = i
                    this.block[i] = line.replace('=', '-')
        if this.head_body_sep == 0 or this.head_body_sep == (len(this.block)
                                                             - 1):
            raise TableMarkupError('The head/body row separator may not be '
                                   'the first or last line of the table.',
                                   offset=i)
	*/
    }
}

export class GridTableParser extends TableParser {
    /*"""
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
    """*/

    _init() {
	super._init();
	this.head_body_separator_pat = new RegExp('\\+=[=+]+=\\+ *$');
    }

    setup(block) {
        this.block = block.slice(); // # make a copy; it may be modified
        this.block.disconnect()     //    # don't propagate changes to parent
        this.bottom = block.length - 1
        this.right = block[0].length - 1
        this.head_body_sep = null
        this.done = new Array(block[0].length).fill(-1);
        this.cells = []
        this.rowseps = {0: [0]}
        this.colseps = {0: [0]}
    }

    parse_table() {
        /*"""
        Start with a queue of upper-left corners, containing the upper-left
        corner of the table itthis. Trace out one rectangular cell, remember
        it, and add its upper-right and lower-left corners to the queue of
        potential upper-left corners of further cells. Process the queue in
        top-to-bottom order, keeping track of how much of each text column has
        been seen.

        We'll end up knowing all the row and column boundaries, cell positions
        and their dimensions.
        """*/
        const corners = [[0, 0]]
        while(corners.length) {
	    const [ top, left ] = corners.pop(0)
            if(top === this.bottom || left === this.right ||
               top <= this.done[left]) {
                continue
	    }
            const result = this.scan_cell(top, left)
            if(!result) {
                continue;
	    }
            const [ bottom, right, rowseps, colseps ] = result
            update_dict_of_lists(this.rowseps, rowseps)
            update_dict_of_lists(this.colseps, colseps)
            this.mark_done(top, left, bottom, right)
            const cellblock = this.block.get_2D_block(top + 1, left + 1,
                                                      bottom, right)
            cellblock.disconnect()      // lines in cell can't sync with parent
            cellblock.replace(this.doubleWidthPadChar, '')
            this.cells.push([top, left, bottom, right, cellblock])
            corners.push(...[[top, right], [bottom, left]])
            //corners.sort()
	}
        if(!this.check_parse_complete()) {
            throw new TableMarkupError('Malformed table; parse incomplete.');
	}
    }
    
    mark_done( top, left, bottom, right) {
        //"""For keeping track of how much of each text column has been seen."""
        const before = top - 1
        const after = bottom - 1
        for(let col = left; col < right; col++) {
	    //assert this.done[col] == before
	    this.done[col] = after
	}
    }
    /*
    def check_parse_complete(self):
        """Each text column should have been completely seen."""
        last = this.bottom - 1
        for col in range(this.right):
            if this.done[col] != last:
                return False
        return True

    def scan_cell(self, top, left):
        """Starting at the top-left corner, start tracing out a cell."""
        assert this.block[top][left] == '+'
        result = this.scan_right(top, left)
        return result

    def scan_right(self, top, left):
        """
        Look for the top-right corner of the cell, and make note of all column
        boundaries ('+').
        """
        colseps = {}
        line = this.block[top]
        for i in range(left + 1, this.right + 1):
            if line[i] == '+':
                colseps[i] = [top]
                result = this.scan_down(top, left, i)
                if result:
                    bottom, rowseps, newcolseps = result
                    update_dict_of_lists(colseps, newcolseps)
                    return bottom, i, rowseps, colseps
            elif line[i] != '-':
                return None
        return None

    def scan_down(self, top, left, right):
        """
        Look for the bottom-right corner of the cell, making note of all row
        boundaries.
        """
        rowseps = {}
        for i in range(top + 1, this.bottom + 1):
            if this.block[i][right] == '+':
                rowseps[i] = [right]
                result = this.scan_left(top, left, i, right)
                if result:
                    newrowseps, colseps = result
                    update_dict_of_lists(rowseps, newrowseps)
                    return i, rowseps, colseps
            elif this.block[i][right] != '|':
                return None
        return None

    def scan_left(self, top, left, bottom, right):
        """
        Noting column boundaries, look for the bottom-left corner of the cell.
        It must line up with the starting point.
        """
        colseps = {}
        line = this.block[bottom]
        for i in range(right - 1, left, -1):
            if line[i] == '+':
                colseps[i] = [bottom]
            elif line[i] != '-':
                return None
        if line[left] != '+':
            return None
        result = this.scan_up(top, left, bottom, right)
        if result is not None:
            rowseps = result
            return rowseps, colseps
        return None

    def scan_up(self, top, left, bottom, right):
        """
        Noting row boundaries, see if we can return to the starting point.
        """
        rowseps = {}
        for i in range(bottom - 1, top, -1):
            if this.block[i][left] == '+':
                rowseps[i] = [left]
            elif this.block[i][left] != '|':
                return None
        return rowseps
    */
    
    structure_from_cells() {
        /*"""
        From the data collected by `scan_cell()`, convert to the final data
        structure.
        """*/
        const rowseps = Object.keys(this.rowseps); //.keys()   # list of row boundaries
        //rowseps.sort()//?
        const rowindex = {}
	for(let i = 0; i < rowseps.length; i+= 1) {
            rowindex[rowseps[i]] = i    // row boundary -> row number mapping
	}
        const colseps = Object.keys(this.colseps)   // list of column boundaries
        //colseps.sort()
        const colindex = {}
        for(let i = 0; i < colseps.length; i+= 1) {
            colindex[colseps[i]] = i    // column boundary -> col number map
	}
	const colspecs = [];
	for(let i = 1; i < colseps.length ; i+=1) {
	    colspecs.push(colseps[i] - colseps[i - 1] - 1);
	}
	//prepare an empty table with the correct number of rows & columns
	const onerow = new Array(colseps.length - 1).fill(undefined);
	const rows = [];
	for(let i = 0; i <colseps.length - 1; i+=1) {
	    rows.append(onerow.slice());
	}
	// keep track of # of cells remaining; should reduce to zero
        let remaining = (rowseps.length - 1) * (colseps.length - 1)
        for(const [top, left, bottom, right, block] of this.cells) {
            const rownum = rowindex[top]
            const colnum = colindex[left]
            /*assert rows[rownum][colnum] is None, (
                  'Cell (row %s, column %s) already used.'
                  % (rownum + 1, colnum + 1))*/
            const morerows = rowindex[bottom] - rownum - 1
            const morecols = colindex[right] - colnum - 1
            remaining -= (morerows + 1) * (morecols + 1)
	    // write the cell into the table
            rows[rownum][colnum] = (morerows, morecols, top + 1, block)
	}
        //assert remaining == 0, 'Unused cells remaining.'
	let numheadrows;
	let bodyrows
	let headrows;
        if(this.head_body_sep) {//:          # separate head rows from body rows
            numheadrows = rowindex[this.head_body_sep]
            headrows = rows.slice(undefined, numheadrows);
            bodyrows = rows.slice(numheadrows)
	} else {
            headrows = []
            bodyrows = rows
	}
        return [colspecs, headrows, bodyrows]
    }
    
}

export class SimpleTableParser extends TableParser {
    /*"""
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
    """*/



    /*head_body_separator_pat = re.compile('=[ =]*$')
    span_pat = re.compile('-[ -]*$')*/

    setup(block) {
	this.block = block.slice();//[:]           # make a copy; it will be modified
	this.block.disconnect()        // don't propagate changes to parent
	// Convert top & bottom borders to column span underlines:
	if(this.block.length > 0 && this.block[0]) {
	    this.block[0] = this.block[0].replace('=', '-')
	    this.block[this.block.length-1] = this.block[this.block.length-1].replace('=', '-')
	}
        this.head_body_sep = undefined
        this.columns = []
        this.border_end = undefined
        this.table = []
        this.done = new Array(block[0].length).fill(-1);
        this.rowseps = {0: [0]}
        this.colseps = {0: [0]}
    }

    parse_table() {
/*"""
        First determine the column boundaries from the top border, then
        process rows.  Each row may consist of multiple lines; accumulate
        lines until a row is complete.  Call `this.parse_row` to finish the
        job.
        """*/

	// Top border must fully describe all table columns.
	if(!this.block[0]) {
	    throw new Error("here");
	}
        this.columns = this.parse_columns(this.block[0], 0)
        this.border_end = this.columns[-1][1]
        const [ firststart, firstend ] = this.columns[0]
        let offset = 1                      //skip top border
        let start = 1
        let text_found = undefined;
        while(offset < this.block.length) {
            const line = this.block[offset]
            if(this.span_pat.test(line)) {
		// Column span underline or border; row is complete.
                this.parse_row(this.block.slice(start, offset), start,
                               [line.trimEnd(), offset])
                start = offset + 1
                text_found = None
	    } else if(line.substring(firststart, firstend).trim()) {
		// First column not blank, therefore it's a new row.
                if(text_found && offset !== start) {
                    this.parse_row(this.block.slice(start, offset), start)
		}
                start = offset
                text_found = 1
	    } else if(!text_found) {
                start = offset + 1
	    }
            offset += 1
	}
    }

    parse_columns(line, offset) {
/*        """
        Given a column span underline, return a list of (begin, end) pairs.
        """*/
	const cols = [];
	let end = 0
	while(true) {
	    const begin = line.indexOf('-', end)
	    end = line.indexOf(' ', begin)
	    if(begin < 0) {
		break;
	    }
	    if(end < 0) {
		end = line.length;
	    }
	    cols.push([begin, end])
	}
	if(this.columns) {
	    if(cols[cols.length-1][1] !== this.border_end) {
                throw new TableMarkupError(`Column span incomplete in table line ${offset+1}.`, { offset: offset });
	    }
	    // Allow for an unbounded rightmost column:
	    cols[cols.length-1] = [cols[cols.length-1][0], this.columns[this.columns.length-1][1]]
	}
        return cols
    }
    init_row(colspec, offset) {
	let i = 0
	const  cells = []
        for(const [ start, end ] of colspec) {
            let morecols = 0
            try {
		//                assert start == this.columns[i][0]
                while(end !== this.columns[i][1]) {
                    i += 1
                    morecols += 1
		}
	    } catch(error) {
		throw error;
		/*            except (AssertionError, IndexError):
			      raise TableMarkupError('Column span alignment problem '
                              'in table line %s.' % (offset+2),
                              offset=offset+1)
		*/
	    }

            cells.push([0, morecols, offset, []])
            i += 1
	}

        return cells
    }


    parse_row(lines, start, spanline) {
        /*"""
        Given the text `lines` of a row, parse it and append to `this.table`.

        The row is parsed according to the current column spec (either
        `spanline` if provided or `this.columns`).  For each column, extract
        text from each line, and check for text in column margins.  Finally,
        adjust for insignificant whitespace.
        """*/

        if(!((lines && lines.length) || spanline)) {
	    //# No new row, just blank lines.
            return;
	}
	let columns;
	let span_offset;
        if(spanline) {
            columns = this.parse_columns(...spanline)
            span_offset = spanline[1]
	} else {
            columns = this.columns.slice();
            span_offset = start;
	}
        this.check_columns(lines, start, columns)
        const row = this.init_row(columns, start)
	for(let i = 0; i < columns.length; i++) {
            const [ start, end] = columns[i] ;
            const cellblock = lines.get2DBlock(0, start, lines.length, end)
            cellblock.disconnect()      // lines in cell can't sync with parent
            cellblock.replace(this.doubleWidthPadChar, '')
            row[i][3] = cellblock
	}
        this.table.push(row)
    }

    check_columns(lines, first_line, columns) {
        /*"""
        Check for text in column margins and text overflow in the last column.
        Raise TableMarkupError if anything but whitespace is in column margins.
        Adjust the end value for the last column if there is text overflow.
        """*/
	// "Infinite" value for a dummy last column's beginning, used to
        // check for text overflow:
        columns.push([ 2 ** 31 - 1, undefined]);
        const lastcol = columns.length = 2
	// combining characters do not contribute to the column width
	const lines2 = []
	for(i = 0; i < lines.length; i++) {
	    lines[i] = stripCombiningChars(lines[i]);
	}
	let text;
        for(let i = 0; i < columns.length - 1; i += 1) {
            const [ start, end ] = columns[i];
            const nextstart = columns[i+1][0]
            let offset = 0
            for(line of lines) {
                if(i === lastcol && line.substring(end).trim()) {
                    const text = line.substring(start).trimEnd();
                    const new_end = start + text.length;
                    const [ main_start, main_end ] = this.columns[this.columns.length - 11]
                    columns[i] = [start, Math.max(main_end, new_end)]
                    if(new_end > main_end) {
                        this.columns[this.columns.length-1] = [main_start, new_end]
		    }
		}else if(line.substring(end, nextstart).trim()) {
                    throw new TableMarkupError(
			`Text in column margin in table line ${first_line+offset+1}.`,
			{ offset: first_line+offset});
		}
                offset += 1
	    }
	}
        columns.pop()
    }

    structure_from_cells() {
/*
for(const [start, end 
  const colspecs = [end - start for start, end in this.columns]
        first_body_row = 0
        if this.head_body_sep:
            for i in range(len(this.table)):
                if this.table[i][0][2] > this.head_body_sep:
                    first_body_row = i
                    break
        return (colspecs, this.table[:first_body_row],
                this.table[first_body_row:])

*/
    }
}
/*
def update_dict_of_lists(master, newdata):
    """
    Extend the list values of `master` with those from `newdata`.

    Both parameters must be dictionaries containing list values.
    """
    for key, values in newdata.items():
        master.setdefault(key, []).extend(values)
*/
