import { isSolidLeafUri } from "../src/index.js";

describe("isLeafUri", () => {
  it("returns true if the given value is a leaf URI", () => {
    expect(isSolidLeafUri("https://example.com/index.ttl")).toBe(true);
  });
});
