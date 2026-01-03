import { inferDataTypeFromValueSet } from "../src/context/util/inferDataTypeFromValueSet.js";

describe("inferDataTypeFromValueSet", () => {
  it("returns undefined for an empty array", () => {
    expect(inferDataTypeFromValueSet([])).toBeUndefined();
  });

  it("returns undefined for string values (IRIs)", () => {
    expect(
      inferDataTypeFromValueSet(["http://example.com/value1"]),
    ).toBeUndefined();
  });

  it("returns the datatype for a single ObjectLiteral with a type", () => {
    expect(
      inferDataTypeFromValueSet([
        { value: "true", type: "http://www.w3.org/2001/XMLSchema#boolean" },
      ]),
    ).toBe("http://www.w3.org/2001/XMLSchema#boolean");
  });

  it("returns the datatype when all ObjectLiterals have the same type", () => {
    expect(
      inferDataTypeFromValueSet([
        { value: "true", type: "http://www.w3.org/2001/XMLSchema#boolean" },
        { value: "false", type: "http://www.w3.org/2001/XMLSchema#boolean" },
      ]),
    ).toBe("http://www.w3.org/2001/XMLSchema#boolean");
  });

  it("returns undefined when ObjectLiterals have different types", () => {
    expect(
      inferDataTypeFromValueSet([
        { value: "true", type: "http://www.w3.org/2001/XMLSchema#boolean" },
        { value: "hello", type: "http://www.w3.org/2001/XMLSchema#string" },
      ]),
    ).toBeUndefined();
  });

  it("returns undefined when an ObjectLiteral has no type", () => {
    expect(inferDataTypeFromValueSet([{ value: "hello" }])).toBeUndefined();
  });

  it("returns undefined for mixed IRI and ObjectLiteral values", () => {
    expect(
      inferDataTypeFromValueSet([
        "http://example.com/value1",
        { value: "true", type: "http://www.w3.org/2001/XMLSchema#boolean" },
      ]),
    ).toBeUndefined();
  });

  it("returns undefined for IriStem values", () => {
    expect(
      inferDataTypeFromValueSet([
        { type: "IriStem", stem: "http://example.com/" },
      ]),
    ).toBeUndefined();
  });

  it("returns undefined for LiteralStem values", () => {
    expect(
      inferDataTypeFromValueSet([{ type: "LiteralStem", stem: "prefix" }]),
    ).toBeUndefined();
  });

  it("returns undefined for Language values", () => {
    expect(
      inferDataTypeFromValueSet([{ type: "Language", languageTag: "en" }]),
    ).toBeUndefined();
  });
});
