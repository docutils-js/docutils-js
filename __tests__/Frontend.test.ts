import { OptionParser, OptionParserArgs } from '../src/Frontend';
import { Publisher } from '../src/Publisher';
import { defaultPublisherOptions } from '../src/constants';
import { createLogger, createPublisher } from '../src/testUtils';


test('1', (): void => {
    const p = createPublisher();
    const argv = ["--title", "mytitle"];
    p.processCommandLine({ argv });
    expect(p.settings!.title).toBe("mytitle");
});

test('--generator', (): void => {
    const p = createPublisher();
    const argv = ["--generator"];
    p.processCommandLine({ argv });
    expect(p.settings!.generator).toBe(true);
});

test('-g', (): void => {
    const p = createPublisher();
    const argv = ["-g"];
    p.processCommandLine({ argv });
    expect(p.settings!.generator).toBe(true);
});

test('--no-generator', (): void => {
    const p = createPublisher();
    const argv = ["--no-generator"];
    p.processCommandLine({ argv });
    expect(p.settings!.generator).toBe(false);
});

test('--date', (): void => {
    const p = createPublisher();
    const argv = ["--date"];
    p.processCommandLine({ argv });
    expect(p.settings!.datestamp).toBe("%Y-%m-%d");
});

test('-d', (): void => {
    const p = createPublisher();
    const argv = ["-d"];
    p.processCommandLine({ argv });
    expect(p.settings!.datestamp).toBe("%Y-%m-%d");
});

test('--time', (): void => {
    const p = createPublisher();
    const argv = ["--time"];
    p.processCommandLine({ argv });
    expect(p.settings!.datestamp).toBe("%Y-%m-%d %H:%M UTC");
});

test('-t', (): void => {
    const p = createPublisher();
    const argv = ["-t"];
    p.processCommandLine({ argv });
    expect(p.settings!.datestamp).toBe("%Y-%m-%d %H:%M UTC");
});

test('--no-datestamp', (): void => {
    const p = createPublisher();
    const argv = ["--no-datestamp"];
    p.processCommandLine({ argv });
    expect(p.settings!.datestamp).toBe(null);
});

test('--source-link', (): void => {
    const p = createPublisher();
    const argv = ["--source-link"];
    p.processCommandLine({ argv });
    expect(p.settings!.sourceLink).toBe(true);
});

test('-s', (): void => {
    const p = createPublisher();
    const argv = ["-s"];
    p.processCommandLine({ argv });
    expect(p.settings!.sourceLink).toBe(true);
});

test('--source-url', (): void => {
    const p = createPublisher();
    const argv = ["--source-url", "myurl"];
    p.processCommandLine({ argv });
    expect(p.settings!.sourceUrl).toBe("myurl");
});

test('--no-source-link', (): void => {
    const p = createPublisher();
    const argv = ["--no-source-link"];
    p.processCommandLine({ argv });
    expect(p.settings!.sourceLink).toBeFalsy();
    expect(p.settings!.sourceUrl).toBe(null);
});

test('--toc-entry-backlinks', (): void => {
    const p = createPublisher();
    const argv = ["--toc-entry-backlinks"];
    p.processCommandLine({ argv });
    expect(p.settings!.tocBacklinks).toBe('entry');
});

test('--toc-top-backlinks', (): void => {
    const p = createPublisher();
    const argv = ["--toc-top-backlinks"];
    p.processCommandLine({ argv });
    expect(p.settings!.tocBacklinks).toBe('top');
});

test('--no-toc-backlinks', (): void => {
    const p = createPublisher();
    const argv = ["--no-toc-backlinks"];
    p.processCommandLine({ argv });
    expect(p.settings!.tocBacklinks).toBe(false);
});

test('--footnote-backlinks', (): void => {
    const p = createPublisher();
    const argv = ["--footnote-backlinks"];
    p.processCommandLine({ argv });
    expect(p.settings!.footnoteBacklinks).toBe(true);
});

test('--no-footnote-backlinks', (): void => {
    const p = createPublisher();
    const argv = ["--no-footnote-backlinks"];
    p.processCommandLine({ argv });
    expect(p.settings!.footnoteBacklinks).toBe(false);
});

test('--section-numbering', (): void => {
    const p = createPublisher();
    const argv = ["--section-numbering"];
    p.processCommandLine({ argv });
    expect(p.settings!.sectnumXform).toBe(true);
});

test('--no-section-numbering', (): void => {
    const p = createPublisher();
    const argv = ["--no-section-numbering"];
    p.processCommandLine({ argv });
    expect(p.settings!.sectnumXform).toBe(false);
});

test('--strip-comments', (): void => {
    const p = createPublisher();
    const argv = ["--strip-comments"];
    p.processCommandLine({ argv });
    expect(p.settings!.stripComments).toBe(true);
});

test('--leave-comments', (): void => {
    const p = createPublisher();
    const argv = ["--leave-comments"];
    p.processCommandLine({ argv });
    expect(p.settings!.stripComments).toBe(false);
});

test('--strip-elements-with-class', (): void => {
    const p = createPublisher();
    const argv = ["--strip-elements-with-class", "foo"];
    p.processCommandLine({ argv });
    expect(p.settings!.stripElementsWithClasses).toHaveLength(1);
    expect(p.settings!.stripElementsWithClasses).toEqual(["foo"]);
});

test('--strip-class', (): void => {
    const p = createPublisher();
    const argv = ["--strip-class", "foo"];
    p.processCommandLine({ argv });
    expect(p.settings!.stripClasses).toHaveLength(1);
    expect(p.settings!.stripClasses).toEqual(["foo"]);
});

test('--report', (): void => {
    const p = createPublisher();
    const argv = ["--report", "info"];
    p.processCommandLine({ argv });
    expect(p.settings!.reportLevel).toEqual(1);
});

test('-r', (): void => {
    const p = createPublisher();
    const argv = ["-r", "info"];
    p.processCommandLine({ argv });
    expect(p.settings!.reportLevel).toEqual(1);
});

test('--verbose', (): void => {
    const p = createPublisher();
    const argv = ["--verbose"];
    p.processCommandLine({ argv });
    expect(p.settings!.reportLevel).toEqual(1);
});

test('-v', (): void => {
    const p = createPublisher();
    const argv = ["-v"];
    p.processCommandLine({ argv });
    expect(p.settings!.reportLevel).toEqual(1);
});

test('--quiet', (): void => {
    const p = createPublisher();
    const argv = ["--quiet"];
    p.processCommandLine({ argv });
    expect(p.settings!.reportLevel).toEqual(5);
});

test('-q', (): void => {
    const p = createPublisher();
    const argv = ["-q"];
    p.processCommandLine({ argv });
    expect(p.settings!.reportLevel).toEqual(5);
});

test('--halt', (): void => {
    const p = createPublisher();
    const argv = ["--halt", "1"];
    p.processCommandLine({ argv });
    expect(p.settings!.haltLevel).toEqual("1");
});

test('--strict', (): void => {
    const p = createPublisher();
    const argv = ["--strict"];
    p.processCommandLine({ argv });
    expect(p.settings!.haltLevel).toEqual(1);
});

test('--exit-status', (): void => {
    const p = createPublisher();
    const argv = ["--exit-status", "4"];
    p.processCommandLine({ argv });
    expect(p.settings!.exitStatusLevel).toEqual("4");
});

test('--debug', (): void => {
    const p = createPublisher();
    const argv = ["--debug"];
    p.processCommandLine({ argv });
    expect(p.settings!.debug).toBe(true);
});

test('--no-debug', (): void => {
    const p = createPublisher();
    const argv = ["--no-debug"];
    p.processCommandLine({ argv });
    expect(p.settings!.debug).toBe(false);
});

test('--warnings', (): void => {
    const p = createPublisher();
    const argv = ["--warnings", "warnings"];
    p.processCommandLine({ argv });
    expect(p.settings!.warningStream).toBe("warnings");
});

test('--traceback', (): void => {
    const p = createPublisher();
    const argv = ["--traceback"];
    p.processCommandLine({ argv });
    expect(p.settings!.traceback).toBe(true);
});

test('--no-traceback', (): void => {
    const p = createPublisher();
    const argv = ["--no-traceback"];
    p.processCommandLine({ argv });
    expect(p.settings!.traceback).toBe(false);
});

test('--input-encoding', (): void => {
    const p = createPublisher();
    const argv = ["--input-encoding", "foo:bar"];
    p.processCommandLine({ argv });
    expect(p.settings!.inputEncoding).toBe("foo:bar");
});

test('-i', (): void => {
    const p = createPublisher();
    const argv = ["-i", "foo:bar"];
    p.processCommandLine({ argv });
    expect(p.settings!.inputEncoding).toBe("foo:bar");
});

test('--output-encoding', (): void => {
    const p = createPublisher();
    const argv = ["--output-encoding", "foo:bar"];
    p.processCommandLine({ argv });
    expect(p.settings!.outputEncoding).toBe("foo:bar");
});

test('-o', (): void => {
    const p = createPublisher();
    const argv = ["-o", "foo:bar"];
    p.processCommandLine({ argv });
    expect(p.settings!.outputEncoding).toBe("foo:bar");
});

test('--output-encoding-error-handler', (): void => {
    const p = createPublisher();
    const argv = ["--output-encoding-error-handler", "replace"];
    p.processCommandLine({ argv });
    expect(p.settings!.outputEncodingErrorHandler).toBe("replace");
});

test('--error-encoding', (): void => {
    const p = createPublisher();
    const argv = ["--error-encoding", "foo:bar"];
    p.processCommandLine({ argv });
    expect(p.settings!.errorEncoding).toBe("foo:bar");
});

test('-e', (): void => {
    const p = createPublisher();
    const argv = ["-e", "foo:bar"];
    p.processCommandLine({ argv });
    expect(p.settings!.errorEncoding).toBe("foo:bar");
});

test('--error-encoding-error-handler', (): void => {
    const p = createPublisher();
    const argv = ["--error-encoding-error-handler", "derp"];
    p.processCommandLine({ argv });
    expect(p.settings!.errorEncodingErrorHandler).toBe("derp");
});

test('--language', (): void => {
    const p = createPublisher();
    const argv = ["--language", "ru"];
    p.processCommandLine({ argv });
    expect(p.settings!.languageCode).toBe("ru");
});

test('-l', (): void => {
    const p = createPublisher();
    const argv = ["-l", "ru"];
    p.processCommandLine({ argv });
    expect(p.settings!.languageCode).toBe("ru");
});

test('--record-dependencies', (): void => {
    const p = createPublisher();
    const argv = ["--record-dependencies", "file"];
    p.processCommandLine({ argv });
    expect(p.settings!.recordDependencies).toBe("file");
});

test('--config', (): void => {
    const p = createPublisher();
    const argv = ["--config", "myconfig"];
    p.processCommandLine({ argv });
});
/* end of optionparser options */
/* begin of restructured text options */

test('--pep-references', (): void => {
    const p = createPublisher();
    const argv = ["--pep-references"];
    p.processCommandLine({ argv });
    expect(p.settings!.pepReferences).toBe(true);
});

test('--pep-base-url', (): void => {
    const p = createPublisher();
    const argv = ["--pep-base-url", "http://foo"];
    p.processCommandLine({ argv });
    expect(p.settings!.pepBaseUrl).toBe("http://foo");
});

test('--pep-base-url', (): void => {
    const p = createPublisher();
    const argv = ["--pep-base-url", "http://foo"];
    p.processCommandLine({ argv });
    expect(p.settings!.pepBaseUrl).toBe("http://foo");
});

test('--pep-file-url-template', (): void => {
    const p = createPublisher();
    const argv = ["--pep-file-url-template", "http://foo"];
    p.processCommandLine({ argv });
    expect(p.settings!.pepFileUrlTemplate).toBe("http://foo");
});

test('--rfc-references', (): void => {
    const p = createPublisher();
    const argv = ["--rfc-references"];
    p.processCommandLine({ argv });
    expect(p.settings!.rfcReferences).toBe(true);
});

test('--rfc-base-url', (): void => {
    const p = createPublisher();
    const argv = ["--rfc-base-url", "http://foo"];
    p.processCommandLine({ argv });
    expect(p.settings!.rfcBaseUrl).toBe("http://foo");
});

test('--tab-width', (): void => {
    const p = createPublisher();
    const argv = ["--tab-width", "100"];
    p.processCommandLine({ argv });
    expect(p.settings!.tabWidth).toBe("100");
});

test('--trim-footnote-reference-space', (): void => {
    const p = createPublisher();
    const argv = ['--trim-footnote-reference-space'];
    p.processCommandLine({ argv });
    expect(p.settings!.trimFootnoteReferenceSpace).toBe(true);
});

test('--leave-footnote-reference-space', (): void => {
    const p = createPublisher();
    const argv = ['--leave-footnote-reference-space'];
    p.processCommandLine({ argv });
    expect(p.settings!.trimFootnoteReferenceSpace).toBe(false);
});

test('--no-file-insertion', (): void => {
    const p = createPublisher();
    const argv = ['--no-file-insertion'];
    p.processCommandLine({ argv });
    expect(p.settings!.fileInsertionEnabled).toBe(false);
});

test('--file-insertion-enabled', (): void => {
    const p = createPublisher();
    const argv = ['--file-insertion-enabled'];
    p.processCommandLine({ argv });
    expect(p.settings!.fileInsertionEnabled).toBe(true);
});

test('--no-raw', (): void => {
    const p = createPublisher();
    const argv = ['--no-raw'];
    p.processCommandLine({ argv });
    expect(p.settings!.rawEnabled).toBe(false);
});

test('--raw-enabled', (): void => {
    const p = createPublisher();
    const argv = ['--raw-enabled'];
    p.processCommandLine({ argv });
    expect(p.settings!.rawEnabled).toBe(true);
});

test('--syntax-highlight short', (): void => {
    const p = createPublisher();
    const argv = ['--syntax-highlight', 'short'];
    p.processCommandLine({ argv });
    expect(p.settings!.syntaxHighlight).toBe("short");
});

test('--syntax-highlight none', (): void => {
    const p = createPublisher();
    const argv = ['--syntax-highlight', 'none'];
    p.processCommandLine({ argv });
    expect(p.settings!.syntaxHighlight).toBe("none");
});

test('--smart-quotes', (): void => {
    const p = createPublisher();
    const argv = ['--smart-quotes', 'test'];
    p.processCommandLine({ argv });
    expect(p.settings!.smartQuotes).toBe("test");
});

test('--smartquotes-locales', (): void => {
    const p = createPublisher();
    const argv = ['--smartquotes-locales', 'a:b,c:d'];
    p.processCommandLine({ argv });
   expect(p.settings!.smartquotesLocales).toBe("a:b,c:d");
});



test('--word-level-inline-markup', (): void => {
    const p = createPublisher();
    const argv = ['--word-level-inline-markup'];
    p.processCommandLine({ argv });
   expect(p.settings!.characterLevelInlineMarkup).toBe(false);
});

test('--character-level-inline-markup', (): void => {
    const p = createPublisher();
    const argv = ['--character-level-inline-markup'];
    p.processCommandLine({ argv });
   expect(p.settings!.characterLevelInlineMarkup).toBe(true);
});
/* end of restructuredtext options */
