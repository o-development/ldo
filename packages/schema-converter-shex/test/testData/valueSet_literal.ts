import type { TestData } from "./testData";

/**
 * VALUE SET
 *
 * value set of string literals
 */
export const valueSetLiteral: TestData = {
  name: "valueSetLiteral",
  shexc: `
  PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
  PREFIX example: <https://example.com/>
  example:IssueShape {
    example:stateText ["unassigned" "assigned"] ? ;
    example:stateNumber [0 "1"^^xsd:decimal] ? ;
  }
  `,
  sampleTurtle: `
    @prefix example: <https://example.com/> .
    <http://example.com/issue/1>
      example:stateText "unassigned" ;
      example:stateNumber "unassigned" ;
      .
  `,
  baseNode: "http://example.com/issue/1",
  successfulContext: {
    stateText: {
      "@id": "https://example.com/stateText",
      "@type": "http://www.w3.org/2001/XMLSchema#string",
    },
    stateNumber: {
      "@id": "https://example.com/stateNumber",
      "@type": "http://www.w3.org/2001/XMLSchema#integer",
    },
  },
  successfulTypings:
    'import { LdSet, LdoJsonldContext } from "@ldo/ldo"\n\nexport interface Issue {\n    "@id"?: string;\n    "@context"?: LdoJsonldContext;\n    stateText?: "unassigned" | "assigned";\n    stateNumber?: number;\n}\n\n',
};
