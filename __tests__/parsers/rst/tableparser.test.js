import { GridTableParser, SimpleTableParser } from '../../../src/parsers/rst/tableparser';

test('gridtableparser', () => {
    const g = new GridTableParser();
    expect(g).toBeDefined();
});

test('simpletableparser', () => {
    const table = new SimpleTableParser();
    expect(table).toBeDefined();
});
