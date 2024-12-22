import parser from "@shexjs/parser";
import { testData } from "./testData/testData";
import { shexjToTyping } from "../src/typing/shexjToTyping";
import type { Schema } from "shexj";

describe("typing", () => {
  testData.forEach(({ name, shexc, successfulTypings }) => {
    it(`Creates a typings for ${name}`, async () => {
      const schema: Schema = parser
        .construct("https://ldo.js.org/")
        .parse(shexc);
      // console.log("SCHEMA:", JSON.stringify(schema, null, 2));
      const [typings] = await shexjToTyping(schema);
      // console.log(typings.typingsString);
      // console.log(JSON.stringify(typings.typingsString));
      expect(typings.typingsString).toBe(successfulTypings);
    });
  });
});
