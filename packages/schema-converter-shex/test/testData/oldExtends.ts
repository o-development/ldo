import type { TestData } from "./testData";

/**
 * Circular
 */
export const oldExtends: TestData = {
  name: "old extends",
  shexc: `
  PREFIX ex: <https://example.com/>
  PREFIX foaf: <http://xmlns.com/foaf/0.1/>

  ex:EntityShape {
    $ex:EntityRef (
      ex:entityId .
    )
  }

  ex:PersonShape {
    $ex:PersonRef (
      &ex:EntityRef ;
      foaf:name .
    )
  }

  ex:EmployeeShape EXTENDS @ex:PersonShape {
    &ex:PersonRef ;
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
    entityId: "https://example.com/entityId",
    name: "http://xmlns.com/foaf/0.1/name",
    employeeNumber: "https://example.com/employeeNumber",
  },
  successfulTypings:
    'import {ContextDefinition} from "jsonld"\n\nexport interface EntityShape {\n    "@id"?: string;\r\n    "@context"?: ContextDefinition;\r\n    entityId: any;\r\n}\r\n\r\nexport interface PersonShape {\n    "@id"?: string;\r\n    "@context"?: ContextDefinition;\r\n    entityId: any;\r\n    name: any;\r\n}\r\n\r\nexport interface EmployeeShape {\n    "@id"?: string;\r\n    "@context"?: ContextDefinition;\r\n    entityId: any;\r\n    name: any;\r\n    employeeNumber: any;\r\n}\r\n\r\n',
};
