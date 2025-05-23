import * as rdfdm from "@rdfjs/data-model";
import { nodeToString } from "../src/index.js";

const { namedNode, blankNode, literal, defaultGraph } = rdfdm;

describe("nodeToString", () => {
  it("returns all the correct values for nodeToString", () => {
    expect(nodeToString(namedNode("http://example.com"))).toBe(
      "namedNode(http://example.com)",
    );
    expect(nodeToString(blankNode("_b1"))).toBe("blankNode(_b1)");
    expect(nodeToString(literal("Hello"))).toBe(
      "literal(Hello,http://www.w3.org/2001/XMLSchema#string)",
    );
    expect(nodeToString(defaultGraph())).toBe("defaultGraph()");
  });
});
