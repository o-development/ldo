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
    SampleParent: {
      "@id": "http://example.com/Parent",
      "@context": {
        type: { "@id": "@type" },
        hasChild: { "@id": "http://example.com/hasChild", "@type": "@id" },
      },
    },
    SampleChild: {
      "@id": "http://example.com/Child",
      "@context": {
        type: { "@id": "@type" },
        hasParent: { "@id": "http://example.com/hasParent", "@type": "@id" },
      },
    },
  },
  successfulTypings:
    'import {ContextDefinition} from "jsonld"\n\nexport interface ParentShape {\n    "@id"?: string;\r\n    "@context"?: ContextDefinition;\r\n    type?: {\r\n        "@id": "Parent";\r\n    };\r\n    hasChild: ChildShape;\r\n}\r\n\r\nexport interface ChildShape {\n    "@id"?: string;\r\n    "@context"?: ContextDefinition;\r\n    type?: {\r\n        "@id": "Child";\r\n    };\r\n    hasParent: ParentShape;\r\n}\r\n\r\n',
};
