import type { TestData } from "./testData.js";

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
    type: {
      "@id": "@type",
      "@isCollection": true,
    },
    Parent: {
      "@id": "http://example.com/Parent",
      "@context": {
        type: {
          "@id": "@type",
          "@isCollection": true,
        },
        hasChild: {
          "@id": "http://example.com/hasChild",
          "@type": "@id",
        },
      },
    },
    hasChild: {
      "@id": "http://example.com/hasChild",
      "@type": "@id",
    },
    Child: {
      "@id": "http://example.com/Child",
      "@context": {
        type: {
          "@id": "@type",
          "@isCollection": true,
        },
        hasParent: {
          "@id": "http://example.com/hasParent",
          "@type": "@id",
        },
      },
    },
    hasParent: {
      "@id": "http://example.com/hasParent",
      "@type": "@id",
    },
  },
  successfulTypings:
    'import { LdSet, LdoJsonldContext } from "@ldo/ldo"\n\nexport interface ParentShape {\n    "@id"?: string;\n    "@context"?: LdoJsonldContext;\n    type?: LdSet<{\n        "@id": "Parent";\n    }>;\n    hasChild: ChildShape;\n}\n\nexport interface ChildShape {\n    "@id"?: string;\n    "@context"?: LdoJsonldContext;\n    type?: LdSet<{\n        "@id": "Child";\n    }>;\n    hasParent: ParentShape;\n}\n\n',
};
