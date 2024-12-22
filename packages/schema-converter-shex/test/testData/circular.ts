import type { TestData } from "./testData";

/**
 * Circular
 */
export const circular: TestData = {
  name: "circular",
  shexc: `
  PREFIX example: <http://example.com/> 

  example:ParentShape {
    a [ example:Parent ]? ;
    example:hasChild @example:ChildShape ;
  }

  example:ChildShape {
    a [ example:Child ]? ;
    example:hasParent @example:ParentShape ;
  }
  `,
  sampleTurtle: `
    @prefix example: <http://example.com/> .

    example:SampleParent
      a example:Parent ;
      example:hasChild example:SampleChild .

    example:SampleChild
      a example:Child ;
      example:hasParent example:SampleParent .
  `,
  baseNode: "http://example.com/SampleParent",
  successfulContext: {
    Parent: {
      "@id": "http://example.com/Parent",
      "@context": {
        type: { "@id": "@type" },
        hasChild: { "@id": "http://example.com/hasChild", "@type": "@id" },
      },
    },
    Child: {
      "@id": "http://example.com/Child",
      "@context": {
        type: { "@id": "@type" },
        hasParent: { "@id": "http://example.com/hasParent", "@type": "@id" },
      },
    },
  },
  successfulTypings:
    'import {ContextDefinition} from "jsonld"\n\nexport interface ParentShape {\n    "@id"?: string;\n    "@context"?: ContextDefinition;\n    type?: {\n        "@id": "Parent";\n    };\n    hasChild: ChildShape;\n}\n\nexport interface ChildShape {\n    "@id"?: string;\n    "@context"?: ContextDefinition;\n    type?: {\n        "@id": "Child";\n    };\n    hasParent: ParentShape;\n}\n\n',
};
