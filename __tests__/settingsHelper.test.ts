import { getDefaultSettings } from "../src/settingsHelper";

test("1", () => {
  expect(getDefaultSettings()).toMatchInlineSnapshot(`
    Object {
      "autoIdPrefix": "id",
      "debug": false,
      "dumpInternals": null,
      "dumpPsuedoXml": null,
      "dumpSettings": null,
      "dumpTransforms": null,
      "errorEncoding": "utf-8",
      "errorEncodingErrorHandler": "backslashreplace",
      "exitStatusLevel": 5,
      "exposeInternalAttribute": null,
      "footnoteBacklinks": true,
      "haltLevel": 4,
      "idPrefix": "",
      "initialHeaderLevel": 1,
      "inputEncodingErrorHandler": "strict",
      "languageCode": "en",
      "mathOutput": "HTML math.css",
      "outputEncoding": "utf-8",
      "outputEncodingErrorHandler": "strict",
      "recordDependencies": null,
      "reportLevel": 2,
      "sectionNumbering": true,
      "strictVisitor": null,
      "tableStyle": "",
      "tocBacklinks": "entry",
      "traceback": null,
      "warningStream": null,
    }
  `);
});
