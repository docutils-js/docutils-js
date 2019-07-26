import { OptionParser, OptionParserArgs } from '../src/Frontend';
import { Publisher } from '../src/Publisher';

test('1', (): void => {
const p = new Publisher({});
const argv = ["--title", "mytitle"];
p.processCommandLine({ argv });
expect(p.settings!.title).toBe("mytitle");
});


test('--generator', (): void => {
const p = new Publisher({});
const argv = ["--generator"];
p.processCommandLine({ argv });
expect(p.settings!.generator).toBe(true);
});


test('-g', (): void => {
const p = new Publisher({});
const argv = ["-g"];
p.processCommandLine({ argv });
expect(p.settings!.generator).toBe(true);
});


test('--no-generator', (): void => {
const p = new Publisher({});
const argv = ["--no-generator"];
p.processCommandLine({ argv });
expect(p.settings!.generator).toBe(false);
});


test('--date', (): void => {
const p = new Publisher({});
const argv = ["--date"];
p.processCommandLine({ argv });
expect(p.settings!.datestamp).toBe("%Y-%m-%d");
});

test('-d', (): void => {
const p = new Publisher({});
const argv = ["-d"];
p.processCommandLine({ argv });
expect(p.settings!.datestamp).toBe("%Y-%m-%d");
});
test('--time', (): void => {
const p = new Publisher({});
const argv = ["--time"];
p.processCommandLine({ argv });
expect(p.settings!.datestamp).toBe("%Y-%m-%d %H:%M UTC");
});
test('-t', (): void => {
const p = new Publisher({});
const argv = ["-t"];
p.processCommandLine({ argv });
expect(p.settings!.datestamp).toBe("%Y-%m-%d %H:%M UTC");
});
test('--no-datestamp', (): void => {
const p = new Publisher({});
const argv = ["--no-datestamp"];
p.processCommandLine({ argv });
expect(p.settings!.datestamp).toBe(null);
});
test('--source-link', (): void => {
const p = new Publisher({});
const argv = ["--source-link"];
p.processCommandLine({ argv });
expect(p.settings!.sourceLink).toBe(true);
});
test('-s', (): void => {
const p = new Publisher({});
const argv = ["-s"];
p.processCommandLine({ argv });
expect(p.settings!.sourceLink).toBe(true);
});
test('--source-url', (): void => {
const p = new Publisher({});
const argv = ["--source-url", "myurl"];
p.processCommandLine({ argv });
expect(p.settings!.sourceUrl).toBe("myurl");
});
test('--no-source-link', (): void => {
const p = new Publisher({});
const argv = ["--no-source-link"];
p.processCommandLine({ argv });
expect(p.settings!.sourceLink).toBeFalsy();
expect(p.settings!.sourceUrl).toBe(null);
});
test('--toc-entry-backlinks', (): void => {
const p = new Publisher({});
const argv = ["--toc-entry-backlinks"];
p.processCommandLine({ argv });
expect(p.settings!.tocBacklinks).toBe('entry');
});
test('--toc-top-backlinks', (): void => {
const p = new Publisher({});
const argv = ["--toc-top-backlinks"];
p.processCommandLine({ argv });
expect(p.settings!.tocBacklinks).toBe('top');
});
test('--no-toc-backlinks', (): void => {
const p = new Publisher({});
const argv = ["--no-toc-backlinks"];
p.processCommandLine({ argv });
expect(p.settings!.tocBacklinks).toBe(false);
});
test('--footnote-backlinks', (): void => {
const p = new Publisher({});
const argv = ["--footnote-backlinks"];
p.processCommandLine({ argv });
expect(p.settings!.footnoteBacklinks).toBe(true);
});
test('--no-footnote-backlinks', (): void => {
const p = new Publisher({});
const argv = ["--no-footnote-backlinks"];
p.processCommandLine({ argv });
expect(p.settings!.footnoteBacklinks).toBe(false);
});
test('--section-numbering', (): void => {
const p = new Publisher({});
const argv = ["--section-numbering"];
p.processCommandLine({ argv });
expect(p.settings!.sectnumXform).toBe(true);
});
test('--no-section-numbering', (): void => {
const p = new Publisher({});
const argv = ["--no-section-numbering"];
p.processCommandLine({ argv });
expect(p.settings!.sectnumXform).toBe(false);
});

test('--strip-comments', (): void => {
const p = new Publisher({});
const argv = ["--strip-comments"];
p.processCommandLine({ argv });
expect(p.settings!.stripComments).toBe(true);
});

test('--leave-comments', (): void => {
const p = new Publisher({});
const argv = ["--leave-comments"];
p.processCommandLine({ argv });
expect(p.settings!.stripComments).toBe(false);
});


test('--strip-elements-with-class', (): void => {
const p = new Publisher({});
const argv = ["--strip-elements-with-class", "foo"];
p.processCommandLine({ argv });
expect(p.settings!.stripElementsWithClasses).toHaveLength(1);
expect(p.settings!.stripElementsWithClasses).toEqual(["foo"]);

});

test('--strip-class', (): void => {
const p = new Publisher({});
const argv = ["--strip-class", "foo"];
p.processCommandLine({ argv });
expect(p.settings!.stripClasses).toHaveLength(1);
expect(p.settings!.stripClasses).toEqual(["foo"]);
});

test('--report', (): void => {
const p = new Publisher({});
const argv = ["--report", "info"];
p.processCommandLine({ argv });
expect(p.settings!.reportLevel).toEqual(1);
});

test('-r', (): void => {
const p = new Publisher({});
const argv = ["-r", "info"];
p.processCommandLine({ argv });
expect(p.settings!.reportLevel).toEqual(1);
});


test('--verbose', (): void => {
const p = new Publisher({});
const argv = ["--verbose"];
p.processCommandLine({ argv });
expect(p.settings!.reportLevel).toEqual(1);
});

test('-v', (): void => {
const p = new Publisher({});
const argv = ["-v"];
p.processCommandLine({ argv });
expect(p.settings!.reportLevel).toEqual(1);
});

test('--quiet', (): void => {
const p = new Publisher({});
const argv = ["--quiet"];
p.processCommandLine({ argv });
expect(p.settings!.reportLevel).toEqual(5);
});
test('-q', (): void => {
const p = new Publisher({});
const argv = ["-q"];
p.processCommandLine({ argv });
expect(p.settings!.reportLevel).toEqual(5);
});
test('--halt', (): void => {
const p = new Publisher({});
const argv = ["--halt", "1"];
p.processCommandLine({ argv });
expect(p.settings!.haltLevel).toEqual("1");
});


test('--strict', (): void => {
const p = new Publisher({});
const argv = ["--strict"];
p.processCommandLine({ argv });
expect(p.settings!.haltLevel).toEqual(1);
});


test('--exit-status', (): void => {
const p = new Publisher({});
const argv = ["--exit-status", "4"];
p.processCommandLine({ argv });
expect(p.settings!.exitStatusLevel).toEqual("4");
});


test('--debug', (): void => {
const p = new Publisher({});
const argv = ["--debug"];
p.processCommandLine({ argv });
expect(p.settings!.debug).toBe(true);
});


test('--no-debug', (): void => {
const p = new Publisher({});
const argv = ["--no-debug"];
p.processCommandLine({ argv });
expect(p.settings!.debug).toBe(false);
});

test('--warnings', (): void => {
const p = new Publisher({});
const argv = ["--warnings", "warnings"];
p.processCommandLine({ argv });
expect(p.settings!.warningStream).toBe("warnings");
});
test('--traceback', (): void => {
const p = new Publisher({});
const argv = ["--traceback"];
p.processCommandLine({ argv });
expect(p.settings!.traceback).toBe(true);
});
test('--no-traceback', (): void => {
const p = new Publisher({});
const argv = ["--no-traceback"];
p.processCommandLine({ argv });
expect(p.settings!.traceback).toBe(false);
});
test('--input-encoding', (): void => {
const p = new Publisher({});
const argv = ["--input-encoding", "foo:bar"];
p.processCommandLine({ argv });
expect(p.settings!.inputEncoding).toBe("foo:bar");
});
test('-i', (): void => {
const p = new Publisher({});
const argv = ["-i", "foo:bar"];
p.processCommandLine({ argv });
expect(p.settings!.inputEncoding).toBe("foo:bar");
});
test('--output-encoding', (): void => {
const p = new Publisher({});
const argv = ["--output-encoding", "foo:bar"];
p.processCommandLine({ argv });
expect(p.settings!.outputEncoding).toBe("foo:bar");
});
test('-o', (): void => {
const p = new Publisher({});
const argv = ["-o", "foo:bar"];
p.processCommandLine({ argv });
expect(p.settings!.outputEncoding).toBe("foo:bar");
});
test('--output-encoding-error-handler', (): void => {
const p = new Publisher({});
const argv = ["--output-encoding-error-handler", "replace"];
p.processCommandLine({ argv });
expect(p.settings!.outputEncodingErrorHandler).toBe("replace");
});
