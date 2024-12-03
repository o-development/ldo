import { testData } from "./testData/testData";
import { shexjToContext } from "../src/context/shexjToContext";
import parser from "@shexjs/parser";
import type { Schema } from "shexj";

describe("context", () => {
  testData.forEach(({ name, shexc, successfulContext }) => {
    it(`Creates a context for ${name}`, async () => {
      const schema: Schema = parser
        .construct("https://ldo.js.org/")
        .parse(shexc);
      console.log(JSON.stringify(schema, null, 2));
      const context = await shexjToContext(schema);
      expect(context).toEqual(successfulContext);
    });
  });
});
