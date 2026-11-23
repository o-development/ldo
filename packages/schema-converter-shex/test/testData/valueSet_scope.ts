import type { TestData } from "./testData";

/**
 * VALUE SET
 * 
 * verify the shape-scoping behavior when processing value sets
 */
export const valueSetScope: TestData = {
  name: "valueSetScope",
  shexc: `
  PREFIX example: <https://example.com/>
  example:ShapeA {
    example:state [example:loading] ;
  }
  example:ShapeB {
    example:state [example:loading] ;
    example:state [example:success] ;
  }
  `,
  sampleTurtle: "",
  baseNode: "",
  successfulContext: {
    state: {
      "@id": "https://example.com/state",
      "@isCollection": true,
    },
    loading: "https://example.com/loading",
    success: "https://example.com/success",
  },
  successfulTypings:
    'import { LdSet, LdoJsonldContext } from "@ldo/ldo"\n\nexport interface ShapeA {\n    "@id"?: string;\n    "@context"?: LdoJsonldContext;\n    state: {\n        "@id": "loading";\n    };\n}\n\nexport interface ShapeB {\n    "@id"?: string;\n    "@context"?: LdoJsonldContext;\n    state: LdSet<{\n        "@id": "loading";\n    } | {\n        "@id": "success";\n    }>;\n}\n\n',
};
