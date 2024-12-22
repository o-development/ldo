import type { TestData } from "./testData";

/**
 * Old Extends
 */
export const oldExtends: TestData = {
  name: "old extends",
  shexc: `
  PREFIX ex: <https://example.com/>
  PREFIX foaf: <http://xmlns.com/foaf/0.1/>

  ex:EntityShape EXTRA a {
    $ex:EntityRef (
      a [ ex:Entity ] ;
      ex:entityId .
    )
  }

  ex:PersonShape EXTRA a {
    $ex:PersonRef (
      &ex:EntityRef ;
      a [ ex:Person ] ;
      foaf:name .
    )
  }

  ex:EmployeeShape EXTRA a {
    &ex:PersonRef ;
    a [ ex:Employee ] ;
    ex:employeeNumber .
  }
  `,
  sampleTurtle: `
    @prefix ex: <http://example.com/> .
    @prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
    @prefix foaf: <http://xmlns.com/foaf/0.1/> .

    ex:SampleEmployee
      ex:entityId "123"^^xsd:integer ;
      foaf:name "Jacko" ;
      ex:employeeNumber "456"^^xsd:integer ;
  `,
  baseNode: "http://example.com/SampleParent",
  successfulContext: {
    Entity: {
      "@id": "https://example.com/Entity",
      "@context": {
        type: {
          "@id": "@type",
        },
        entityId: "https://example.com/entityId",
      },
    },
    Person: {
      "@id": "https://example.com/Person",
      "@context": {
        type: {
          "@id": "@type",
        },
        entityId: "https://example.com/entityId",
        name: "http://xmlns.com/foaf/0.1/name",
      },
    },
    Employee: {
      "@id": "https://example.com/Employee",
      "@context": {
        type: {
          "@id": "@type",
        },
        entityId: "https://example.com/entityId",
        name: "http://xmlns.com/foaf/0.1/name",
        employeeNumber: "https://example.com/employeeNumber",
      },
    },
  },
  successfulTypings:
    'import {ContextDefinition} from "jsonld"\n\nexport interface EntityShape {\n    "@id"?: string;\n    "@context"?: ContextDefinition;\n    type: {\n        "@id": "Entity";\n    };\n    entityId: any;\n}\n\nexport interface PersonShape {\n    "@id"?: string;\n    "@context"?: ContextDefinition;\n    type: ({\n        "@id": "Entity";\n    } | {\n        "@id": "Person";\n    })[];\n    entityId: any;\n    name: any;\n}\n\nexport interface EmployeeShape {\n    "@id"?: string;\n    "@context"?: ContextDefinition;\n    type: ({\n        "@id": "Entity";\n    } | {\n        "@id": "Person";\n    } | {\n        "@id": "Employee";\n    })[];\n    entityId: any;\n    name: any;\n    employeeNumber: any;\n}\n\n',
};
