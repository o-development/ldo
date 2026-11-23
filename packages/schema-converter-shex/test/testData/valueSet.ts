import type { TestData } from "./testData";

/**
 * VALUE SET
 * 
 * see https://shex.io/shex-primer/#value-sets
 */
export const valueSet: TestData = {
  name: "valueSet",
  shexc: `
  PREFIX example: <https://example.com/>
  example:IssueShape {
    example:stateSingle [example:unassigned example:assigned] ;
    example:stateMulti [example:one example:two example:three] * ;
  }
  `,
  sampleTurtle: `
    @prefix example: <https://example.com/> .
    <http://example.com/issue/1>
      example:stateSingle example:unassigned ;
      example:stateMulti example:one, example:three ;
      .
  `,
  baseNode: "http://example.com/issue/1",
  successfulContext: {
    stateSingle: {
      "@id": "https://example.com/stateSingle",
    },
    stateMulti: {
      "@id": "https://example.com/stateMulti",
      "@isCollection": true,
    },
    unassigned: "https://example.com/unassigned",
    assigned: "https://example.com/assigned",
    one: "https://example.com/one",
    two: "https://example.com/two",
    three: "https://example.com/three",
  },
  successfulTypings:
    'import { LdSet, LdoJsonldContext } from "@ldo/ldo"\n\nexport interface Issue {\n    "@id"?: string;\n    "@context"?: LdoJsonldContext;\n    stateSingle: {\n        "@id": "unassigned";\n    } | {\n        "@id": "assigned";\n    };\n    stateMulti?: LdSet<{\n        "@id": "one";\n    } | {\n        "@id": "two";\n    } | {\n        "@id": "three";\n    }>;\n}\n\n',
};
