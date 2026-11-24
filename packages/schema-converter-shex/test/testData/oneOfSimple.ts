import type { TestData } from "./testData";

/**
 * SIMPLE OneOf
 *
 * see https://shex.io/shex-primer/#choices
 * TODO: the types for all choices should be optional
 * if they occurr in one branch only, e.g. name?: string;
 */
export const oneOfSimple: TestData = {
  name: "oneOfSimple",
  shexc: `
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX example: <https://example.com/>
    example:UserShape {
      ( 
        foaf:name xsd:string
      |
        foaf:givenName xsd:string + ;
        foaf:familyName xsd:string
      ) ;
      foaf:mbox IRI
    }
  `,
  sampleTurtle: `
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    <http://a.example/User1>
      foaf:givenName "Robert", "Taylor" ;
      foaf:familyName "Johnson" ;
      foaf:mbox <mailto:rtj@example.com> ;
      .
  `,
  baseNode: "http://a.example/User1",
  successfulContext: {
    name: {
      "@id": "http://xmlns.com/foaf/0.1/name",
      "@type": "http://www.w3.org/2001/XMLSchema#string",
    },
    givenName: {
      "@id": "http://xmlns.com/foaf/0.1/givenName",
      "@type": "http://www.w3.org/2001/XMLSchema#string",
      "@isCollection": true,
    },
    familyName: {
      "@id": "http://xmlns.com/foaf/0.1/familyName",
      "@type": "http://www.w3.org/2001/XMLSchema#string",
    },
    mbox: {
      "@id": "http://xmlns.com/foaf/0.1/mbox",
      "@type": "@id",
    },
  },
  successfulTypings:
    'import { LdSet, LdoJsonldContext } from "@ldo/ldo"\n\nexport interface User {\n    "@id"?: string;\n    "@context"?: LdoJsonldContext;\n    name: string;\n    givenName: LdSet<string>;\n    familyName: string;\n    mbox: {\n        "@id": string;\n    };\n}\n\n',
};
