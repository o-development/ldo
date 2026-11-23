import type { TestData } from "./testData";

/**
 * VALUE SET
 * 
 * value set of string literals
 */
export const valueSetString: TestData = {
  name: "valueSetString",
  shexc: `
  PREFIX example: <https://example.com/>
  example:IssueShape {
    example:state [example:unassigned example:assigned] ;
    example:stateText ["unassigned" "assigned"] ? ;
  }
  `,
  sampleTurtle: `
    @prefix example: <https://example.com/> .
    <http://example.com/issue/1>
      example:state example:unassigned ;
      example:stateText "unassigned" ;
      .
  `,
  baseNode: "http://example.com/issue/1",
  successfulContext: {
    state: {
      "@id": "https://example.com/state",
    },
    unassigned: "https://example.com/unassigned",
    assigned: "https://example.com/assigned",
    stateText: {
      "@id": "https://example.com/stateText",
      "@type": "http://www.w3.org/2001/XMLSchema#string",
    },
  },
  successfulTypings:
    'import { LdSet, LdoJsonldContext } from "@ldo/ldo"\n\nexport interface Issue {\n    "@id"?: string;\n    "@context"?: LdoJsonldContext;\n    state: {\n        "@id": "unassigned";\n    } | {\n        "@id": "assigned";\n    };\n    stateText?: "unassigned" | "assigned";\n}\n\n',
};
