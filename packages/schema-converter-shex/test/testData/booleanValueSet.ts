import type { TestData } from "./testData.js";

/**
 * BOOLEAN VALUE SET
 * Tests that dataType is inferred from a value set with boolean typed literals
 */
export const booleanValueSet: TestData = {
  name: "booleanValueSet",
  shexc: `
  PREFIX ex: <https://example.com/>
  PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

  ex:FeatureShape {
    a [ ex:Feature ];
    ex:isEnabled [ "true"^^xsd:boolean "false"^^xsd:boolean ] ;
  }
  `,
  sampleTurtle: `
    @prefix ex: <https://example.com/> .
    @prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
    <http://example.com/Feature1>
      a ex:Feature ;
      ex:isEnabled "true"^^xsd:boolean ;
      .
  `,
  baseNode: "http://example.com/Feature1",
  successfulContext: {
    type: {
      "@id": "@type",
      "@isCollection": true,
    },
    Feature: {
      "@id": "https://example.com/Feature",
      "@context": {
        type: {
          "@id": "@type",
          "@isCollection": true,
        },
        isEnabled: {
          "@id": "https://example.com/isEnabled",
          "@type": "http://www.w3.org/2001/XMLSchema#boolean",
        },
      },
    },
    isEnabled: {
      "@id": "https://example.com/isEnabled",
      "@type": "http://www.w3.org/2001/XMLSchema#boolean",
    },
  },
  successfulTypings:
    'import { LdSet, LdoJsonldContext } from "@ldo/ldo"\n\nexport interface Feature {\n    "@id"?: string;\n    "@context"?: LdoJsonldContext;\n    type: LdSet<{\n        "@id": "Feature";\n    }>;\n    isEnabled: boolean;\n}\n\n',
};
