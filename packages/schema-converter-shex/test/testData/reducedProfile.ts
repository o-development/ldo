import type { TestData } from "./testData";

/**
 * Reduced Profile
 */
export const reducedProfile: TestData = {
  name: "reduced profile",
  shexc: `
PREFIX srs: <https://shaperepo.com/schemas/solidProfile#>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX schem: <http://schema.org/>
PREFIX vcard: <http://www.w3.org/2006/vcard/ns#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX acl: <http://www.w3.org/ns/auth/acl#>
PREFIX cert:  <http://www.w3.org/ns/auth/cert#>
PREFIX ldp: <http://www.w3.org/ns/ldp#>
PREFIX sp: <http://www.w3.org/ns/pim/space#>
PREFIX solid: <http://www.w3.org/ns/solid/terms#>

srs:SolidProfileShape EXTRA a {
  a [ schem:Person ]
    // rdfs:comment  "Defines the node as a Person" ;
  a [ foaf:Person ]
    // rdfs:comment  "Defines the node as a Person" ;
  vcard:hasEmail @srs:EmailShape *
    // rdfs:comment  "The person's email." ;
  foaf:name xsd:string ?
    // rdfs:comment  "An alternate way to define a person's name" ;
}

srs:EmailShape EXTRA a {
  a [
    vcard:Dom
    vcard:Home
    vcard:ISDN
    vcard:Internet
    vcard:Intl
    vcard:Label
    vcard:Parcel
    vcard:Postal
    vcard:Pref
    vcard:Work
    vcard:X400
  ] ?
    // rdfs:comment  "The type of email." ;
  vcard:value IRI
    // rdfs:comment  "The value of an email as a mailto link (Example <mailto:jane@example.com>)" ;
}
  `,
  sampleTurtle: ``,
  baseNode: "",
  successfulContext: {
    type: { "@id": "@type" },
    Person: "http://schema.org/Person",
    Person2: "http://xmlns.com/foaf/0.1/Person",
    hasEmail: {
      "@id": "http://www.w3.org/2006/vcard/ns#hasEmail",
      "@type": "@id",
      "@container": "@set",
    },
    Dom: "http://www.w3.org/2006/vcard/ns#Dom",
    Home: "http://www.w3.org/2006/vcard/ns#Home",
    ISDN: "http://www.w3.org/2006/vcard/ns#ISDN",
    Internet: "http://www.w3.org/2006/vcard/ns#Internet",
    Intl: "http://www.w3.org/2006/vcard/ns#Intl",
    Label: "http://www.w3.org/2006/vcard/ns#Label",
    Parcel: "http://www.w3.org/2006/vcard/ns#Parcel",
    Postal: "http://www.w3.org/2006/vcard/ns#Postal",
    Pref: "http://www.w3.org/2006/vcard/ns#Pref",
    Work: "http://www.w3.org/2006/vcard/ns#Work",
    X400: "http://www.w3.org/2006/vcard/ns#X400",
    value: { "@id": "http://www.w3.org/2006/vcard/ns#value", "@type": "@id" },
    name: {
      "@id": "http://xmlns.com/foaf/0.1/name",
      "@type": "http://www.w3.org/2001/XMLSchema#string",
    },
  },
  successfulTypings:
    'import {ContextDefinition} from "jsonld"\n\nexport interface SolidProfileShape {\n    "@id"?: string;\r\n    "@context"?: ContextDefinition;\r\n    /**\r\n     * Defines the node as a Person | Defines the node as a Person\r\n     */\r\n    type: ({\r\n        "@id": "Person";\r\n    } | {\r\n        "@id": "Person2";\r\n    })[];\r\n    /**\r\n     * The person\'s email.\r\n     */\r\n    hasEmail?: (EmailShape)[];\r\n    /**\r\n     * An alternate way to define a person\'s name\r\n     */\r\n    name?: string;\r\n}\r\n\r\nexport interface EmailShape {\n    "@id"?: string;\r\n    "@context"?: ContextDefinition;\r\n    /**\r\n     * The type of email.\r\n     */\r\n    type?: {\r\n        "@id": "Dom";\r\n    } | {\r\n        "@id": "Home";\r\n    } | {\r\n        "@id": "ISDN";\r\n    } | {\r\n        "@id": "Internet";\r\n    } | {\r\n        "@id": "Intl";\r\n    } | {\r\n        "@id": "Label";\r\n    } | {\r\n        "@id": "Parcel";\r\n    } | {\r\n        "@id": "Postal";\r\n    } | {\r\n        "@id": "Pref";\r\n    } | {\r\n        "@id": "Work";\r\n    } | {\r\n        "@id": "X400";\r\n    };\r\n    /**\r\n     * The value of an email as a mailto link (Example <mailto:jane@example.com>)\r\n     */\r\n    value: {\r\n        "@id": string;\r\n    };\r\n}\r\n\r\n',
};
