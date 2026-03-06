import parser from "@shexjs/parser";
import { testData } from "./testData/testData.js";
import { shexjToTyping } from "../src/typing/shexjToTyping.js";
import type { Schema } from "shexj";

console.warn = () => {};

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
