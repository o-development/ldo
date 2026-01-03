import { createDataset } from "@ldo/dataset";
import { ContextUtil } from "../src/ContextUtil.js";
import { nodeToJsonldRepresentation } from "../src/util/nodeToJsonldRepresentation.js";
import { defaultGraph, literal } from "@ldo/rdf-utils";
import { ProxyContext } from "../src/index.js";

describe("objectToJsonRepresentation", () => {
  const extraParams: ProxyContext = new ProxyContext({
    dataset: createDataset(),
    contextUtil: new ContextUtil({}),
    writeGraphs: [defaultGraph()],
    languageOrdering: ["@none", "@other"],
  });

  it("returns a string for hexBinary", () => {
    expect(
      nodeToJsonldRepresentation(
        literal("F03493", "http://www.w3.org/2001/XMLSchema#hexBinary"),
        extraParams,
      ),
    ).toBe("F03493");
  });

  it("returns a string for HTML", () => {
    expect(
      nodeToJsonldRepresentation(
        literal(
          "<body></body>",
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#HTML",
        ),
        extraParams,
      ),
    ).toBe("<body></body>");
  });

  it("returns a string for anyUri", () => {
    expect(
      nodeToJsonldRepresentation(
        literal(
          "http://example.com",
          "http://www.w3.org/2001/XMLSchema#anyURI",
        ),
        extraParams,
      ),
    ).toBe("http://example.com");
  });

  it("returns a string for an unrecognized datatype", () => {
    expect(
      nodeToJsonldRepresentation(
        literal("meh", "http://weirddatatype.com"),
        extraParams,
      ),
    ).toBe("meh");
  });

  it("returns a Date for xsd:date", () => {
    const result = nodeToJsonldRepresentation(
      literal("2024-06-15", "http://www.w3.org/2001/XMLSchema#date"),
      extraParams,
    );
    expect(result).toBeInstanceOf(Date);
    expect((result as Date).toISOString()).toBe("2024-06-15T00:00:00.000Z");
  });

  it("returns a Date for xsd:dateTime", () => {
    const result = nodeToJsonldRepresentation(
      literal(
        "2024-06-15T14:30:00Z",
        "http://www.w3.org/2001/XMLSchema#dateTime",
      ),
      extraParams,
    );
    expect(result).toBeInstanceOf(Date);
    expect((result as Date).toISOString()).toBe("2024-06-15T14:30:00.000Z");
  });

  it("returns a Date for xsd:dateTime with timezone offset", () => {
    const result = nodeToJsonldRepresentation(
      literal(
        "2024-06-15T14:30:00+05:00",
        "http://www.w3.org/2001/XMLSchema#dateTime",
      ),
      extraParams,
    );
    expect(result).toBeInstanceOf(Date);
    expect((result as Date).toISOString()).toBe("2024-06-15T09:30:00.000Z");
  });

  it("returns a string for xsd:time", () => {
    expect(
      nodeToJsonldRepresentation(
        literal("14:30:00", "http://www.w3.org/2001/XMLSchema#time"),
        extraParams,
      ),
    ).toBe("14:30:00");
  });

  it("returns a string for xsd:duration", () => {
    expect(
      nodeToJsonldRepresentation(
        literal("P1Y2M3D", "http://www.w3.org/2001/XMLSchema#duration"),
        extraParams,
      ),
    ).toBe("P1Y2M3D");
  });
  it("throws an error when it encounters a quad that is not a Literal, NamedNode, or BlankNode", () => {
    expect(() =>
      // @ts-expect-error defaultGraph is not allowed
      nodeToJsonldRepresentation(defaultGraph(), extraParams),
    ).toThrow("Can only convert NamedNodes or Literals or BlankNodes");
  });
});
