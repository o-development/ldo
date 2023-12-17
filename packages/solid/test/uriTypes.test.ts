import { isLeafUri } from "../src";

describe("isLeafUri", () => {
  it("returns true if the given value is a leaf URI", () => {
    expect(isLeafUri("https://example.com/index.ttl")).toBe(true);
  });
});
