import type { TestData } from "./testData";

/**
 * VALUE SET
 *
 * OneOf connection of two value sets
 * see https://shex.io/shex-primer/#choices
 */
export const valueSetOneof: TestData = {
  name: "valueSetOneof",
  shexc: `
  PREFIX example: <https://example.com/>
  example:IssueShape {
    ( example:state [example:one] | example:state [example:two] ) ;
  }
  `,
  sampleTurtle: "",
  baseNode: "",
  successfulContext: {
    state: {
      "@id": "https://example.com/state",
    },
    one: "https://example.com/one",
    two: "https://example.com/two",
  },
  successfulTypings:
    'import { LdSet, LdoJsonldContext } from "@ldo/ldo"\n\nexport interface Issue {\n    "@id"?: string;\n    "@context"?: LdoJsonldContext;\n    state: {\n        "@id": "one";\n    } | {\n        "@id": "two";\n    };\n}\n\n',
};
