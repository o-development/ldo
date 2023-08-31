import type { TestData } from "./testData";

/**
 * Circular
 */
export const extendsSimple: TestData = {
  name: "extends simple",
  shexc: `
  PREFIX ex: <https://example.com/>
  PREFIX foaf: <http://xmlns.com/foaf/0.1/>

  ex:EntityShape {
    ex:entityId .
  }

  ex:PersonShape EXTENDS @ex:EntityShape {
    foaf:name .
  }

  ex:EmployeeShape EXTENDS @ex:PersonShape {
    ex:employeeNumber .
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
    entityId: "https://example.com/entityId",
    name: "http://xmlns.com/foaf/0.1/name",
    employeeNumber: "https://example.com/employeeNumber",
  },
  successfulTypings:
    'import {ContextDefinition} from "jsonld"\n\nexport interface EntityShape {\n    "@id"?: string;\r\n    "@context"?: ContextDefinition;\r\n    entityId: any;\r\n}\r\n\r\nexport interface PersonShapeextends EntityShape {\n    "@id"?: string;\r\n    "@context"?: ContextDefinition;\r\n    name: any;\r\n}\r\n\r\nexport interface EmployeeShapeextends PersonShape {\n    "@id"?: string;\r\n    "@context"?: ContextDefinition;\r\n    employeeNumber: any;\r\n}\r\n\r\n',
};
