import { getDefaultSettings } from "../src/settingsHelper";

test("1", () => {
  expect(getDefaultSettings()).toMatchInlineSnapshot(`undefined`);
});
