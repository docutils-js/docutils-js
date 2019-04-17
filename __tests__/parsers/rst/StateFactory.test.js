import StateFactory from "../../../src/parsers/rst/StateFactory";

test("StateFactory.getStateClasses", () => {
  const stateFactory = new StateFactory();
  expect(stateFactory.getStateClasses()).toMatchInlineSnapshot(`
    Array [
      [Function],
      [Function],
      [Function],
      [Function],
      [Function],
      [Function],
      [Function],
      [Function],
      [Function],
      [Function],
      [Function],
      [Function],
    ]
  `);
});
