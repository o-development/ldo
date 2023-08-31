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
    app:name xsd:string ;
    app:path IRI ;
  }

  app:VocabularyShape {
    rdf:type [ app:Vocabulary ] ;
    app:name xsd:string ;
    app:path IRI ;
  }
  `,
  sampleTurtle: ``,
  baseNode: "http://example.com/SampleParent",
  successfulContext: {
    type: { "@id": "@type" },
    Document: "https://www.forsakringskassan.se/vocabs/fk-sem-poc.ttl#Document",
    vocabulary: {
      "@id":
        "https://www.forsakringskassan.se/vocabs/fk-sem-poc.ttl#vocabulary",
      "@type": "@id",
      "@container": "@set",
    },
    Vocabulary:
      "https://www.forsakringskassan.se/vocabs/fk-sem-poc.ttl#Vocabulary",
    name: {
      "@id": "https://www.forsakringskassan.se/vocabs/fk-sem-poc.ttl#name",
      "@type": "http://www.w3.org/2001/XMLSchema#string",
    },
    path: {
      "@id": "https://www.forsakringskassan.se/vocabs/fk-sem-poc.ttl#path",
      "@type": "@id",
    },
    law: {
      "@id": "https://www.forsakringskassan.se/vocabs/fk-sem-poc.ttl#law",
      "@type": "@id",
    },
    Law: "https://www.forsakringskassan.se/vocabs/fk-sem-poc.ttl#Law",
  },
  successfulTypings:
    'import {ContextDefinition} from "jsonld"\n\nexport interface DocumentShape {\n    "@id"?: string;\r\n    "@context"?: ContextDefinition;\r\n    type: {\r\n        "@id": "Document";\r\n    };\r\n    vocabulary?: (VocabularyShape)[];\r\n    law: LawShape;\r\n}\r\n\r\nexport interface LawShape {\n    "@id"?: string;\r\n    "@context"?: ContextDefinition;\r\n    type: {\r\n        "@id": "Law";\r\n    };\r\n    name: string;\r\n    path: {\r\n        "@id": string;\r\n    };\r\n}\r\n\r\nexport interface VocabularyShape {\n    "@id"?: string;\r\n    "@context"?: ContextDefinition;\r\n    type: {\r\n        "@id": "Vocabulary";\r\n    };\r\n    name: string;\r\n    path: {\r\n        "@id": string;\r\n    };\r\n}\r\n\r\n',
};
