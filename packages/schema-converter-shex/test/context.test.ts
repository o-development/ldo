import { testData } from "./testData/testData";
import { shexjToContext } from "../src/context/shexjToContext";
import parser from "@shexjs/parser";
import type { Schema } from "shexj";

console.warn = () => {};

describe("context", () => {
  testData.forEach(({ name, shexc, successfulContext }) => {
    it(`Creates a context for ${name}`, async () => {
      const schema: Schema = parser
        .construct("https://ldo.js.org/")
        .parse(shexc);
      // console.log("SCHEMA:", JSON.stringify(schema, null, 2));
      const context = await shexjToContext(schema);
      // console.log("CONTEXT:", JSON.stringify(context, null, 2));
      expect(context).toEqual(successfulContext);
    });
  });
});
