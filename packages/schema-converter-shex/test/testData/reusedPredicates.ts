import type { TestData } from "./testData";

/**
 * Reused Predicate
 */
export const reusedPredicates: TestData = {
  name: "reused predicates",
  shexc: `
  PREFIX app:   <https://www.forsakringskassan.se/vocabs/fk-sem-poc.ttl#>
  PREFIX rdf:   <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX xsd:   <http://www.w3.org/2001/XMLSchema#>

  app:DocumentShape {
    rdf:type [ app:Document ] ;
    app:vocabulary @app:VocabularyShape* ;
    app:law @app:LawShape ;
  }

  app:LawShape {
    rdf:type [ app:Law ] ;
    app:name xsd:string *;
    app:path IRI ;
  }

  app:VocabularyShape {
    rdf:type [ app:Vocabulary ] ;
    app:name xsd:string ;
    app:path IRI *;
  }
  `,
  sampleTurtle: ``,
  baseNode: "http://example.com/SampleParent",
  successfulContext: {
    Document: {
      "@id": "https://www.forsakringskassan.se/vocabs/fk-sem-poc.ttl#Document",
      "@context": {
        type: {
          "@id": "@type",
        },
        vocabulary: {
          "@id":
            "https://www.forsakringskassan.se/vocabs/fk-sem-poc.ttl#vocabulary",
          "@type": "@id",
          "@isCollection": true,
        },
        law: {
          "@id": "https://www.forsakringskassan.se/vocabs/fk-sem-poc.ttl#law",
          "@type": "@id",
        },
      },
    },
    Vocabulary: {
      "@id":
        "https://www.forsakringskassan.se/vocabs/fk-sem-poc.ttl#Vocabulary",
      "@context": {
        type: {
          "@id": "@type",
        },
        name: {
          "@id": "https://www.forsakringskassan.se/vocabs/fk-sem-poc.ttl#name",
          "@type": "http://www.w3.org/2001/XMLSchema#string",
        },
        path: {
          "@id": "https://www.forsakringskassan.se/vocabs/fk-sem-poc.ttl#path",
          "@type": "@id",
          "@isCollection": true,
        },
      },
    },
    Law: {
      "@id": "https://www.forsakringskassan.se/vocabs/fk-sem-poc.ttl#Law",
      "@context": {
        type: {
          "@id": "@type",
        },
        name: {
          "@id": "https://www.forsakringskassan.se/vocabs/fk-sem-poc.ttl#name",
          "@type": "http://www.w3.org/2001/XMLSchema#string",
          "@isCollection": true,
        },
        path: {
          "@id": "https://www.forsakringskassan.se/vocabs/fk-sem-poc.ttl#path",
          "@type": "@id",
        },
      },
    },
  },
  successfulTypings:
    'import {ContextDefinition} from "jsonld"\n\nexport interface DocumentShape {\n    "@id"?: string;\n    "@context"?: ContextDefinition;\n    type: {\n        "@id": "Document";\n    };\n    vocabulary?: (VocabularyShape)[];\n    law: LawShape;\n}\n\nexport interface LawShape {\n    "@id"?: string;\n    "@context"?: ContextDefinition;\n    type: {\n        "@id": "Law";\n    };\n    name?: string[];\n    path: {\n        "@id": string;\n    };\n}\n\nexport interface VocabularyShape {\n    "@id"?: string;\n    "@context"?: ContextDefinition;\n    type: {\n        "@id": "Vocabulary";\n    };\n    name: string;\n    path?: {\n        "@id": string;\n    }[];\n}\n\n',
};
