import type { TestData } from "./testData";

/**
 * SIMPLE
 */
export const simple: TestData = {
  name: "simple",
  shexc: `
  PREFIX foaf: <http://xmlns.com/foaf/0.1/>
  PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
  PREFIX example: <https://example.com/>

  example:EmployeeShape {                # An <EmployeeShape> has:
    foaf:givenName  xsd:string+,   # at least one givenName.
    foaf:familyName xsd:string,    # one familyName.
    foaf:phone      IRI*,          # any number of phone numbers.
    foaf:mbox       IRI            # one FOAF mbox.
  }
  `,
  sampleTurtle: `
    @prefix foaf: <http://xmlns.com/foaf/0.1/> .
    @prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
    <http://a.example/Employee7>
      foaf:givenName  "Robert"^^xsd:string, "Taylor"^^xsd:string ;
      foaf:familyName "Johnson"^^xsd:string ;
      # no phone number needed
      foaf:mbox       <mailto:rtj@example.com>
      .
  `,
  baseNode: "http://a.example/Employee7",
  successfulContext: {
    givenName: {
      "@id": "http://xmlns.com/foaf/0.1/givenName",
      "@type": "http://www.w3.org/2001/XMLSchema#string",
      "@container": "@set",
    },
    familyName: {
      "@id": "http://xmlns.com/foaf/0.1/familyName",
      "@type": "http://www.w3.org/2001/XMLSchema#string",
    },
    phone: {
      "@id": "http://xmlns.com/foaf/0.1/phone",
      "@type": "@id",
      "@container": "@set",
    },
    mbox: { "@id": "http://xmlns.com/foaf/0.1/mbox", "@type": "@id" },
  },
  successfulTypings:
    'import {ContextDefinition} from "jsonld"\n\nexport interface EmployeeShape {\n    "@id"?: string;\r\n    "@context"?: ContextDefinition;\r\n    givenName: string[];\r\n    familyName: string;\r\n    phone?: {\r\n        "@id": string;\r\n    }[];\r\n    mbox: {\r\n        "@id": string;\r\n    };\r\n}\r\n\r\n',
};
