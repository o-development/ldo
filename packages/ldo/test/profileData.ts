import type { Schema } from "shexj";
import type { ContextDefinition } from "jsonld";
import {
  RequiredFrom,
  RequiredAs,
  OptionalFrom,
  OptionalAs,
  SetFrom,
  LiteralAs,
  LiteralFrom,
  NamedNodeAs,
  NamedNodeFrom,
  TermAs,
  TermFrom,
} from "@rdfjs/wrapper";
import { LdoTermWrapper } from "../src/LdoTermWrapper";

export const profileShex: Schema = {
  type: "Schema",
  shapes: [
    {
      id: "https://shaperepo.com/schemas/solidProfile#SolidProfileShape",
      type: "ShapeDecl",
      shapeExpr: {
        type: "Shape",
        expression: {
          type: "EachOf",
          expressions: [
            {
              type: "TripleConstraint",
              predicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
              valueExpr: {
                type: "NodeConstraint",
                values: ["http://schema.org/Person"],
              },
              annotations: [
                {
                  type: "Annotation",
                  predicate: "http://www.w3.org/2000/01/rdf-schema#comment",
                  object: {
                    value: "Defines the node as a Person (from Schema.org)",
                  },
                },
              ],
            },
            {
              type: "TripleConstraint",
              predicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
              valueExpr: {
                type: "NodeConstraint",
                values: ["http://xmlns.com/foaf/0.1/Person"],
              },
              annotations: [
                {
                  type: "Annotation",
                  predicate: "http://www.w3.org/2000/01/rdf-schema#comment",
                  object: {
                    value: "Defines the node as a Person (from foaf)",
                  },
                },
              ],
            },
            {
              type: "TripleConstraint",
              predicate: "http://www.w3.org/2006/vcard/ns#fn",
              valueExpr: {
                type: "NodeConstraint",
                datatype: "http://www.w3.org/2001/XMLSchema#string",
              },
              min: 0,
              max: 1,
              annotations: [
                {
                  type: "Annotation",
                  predicate: "http://www.w3.org/2000/01/rdf-schema#comment",
                  object: {
                    value:
                      "The formatted name of a person. Example: John Smith",
                  },
                },
              ],
            },
            {
              type: "TripleConstraint",
              predicate: "http://xmlns.com/foaf/0.1/name",
              valueExpr: {
                type: "NodeConstraint",
                datatype: "http://www.w3.org/2001/XMLSchema#string",
              },
              min: 0,
              max: 1,
              annotations: [
                {
                  type: "Annotation",
                  predicate: "http://www.w3.org/2000/01/rdf-schema#comment",
                  object: {
                    value: "An alternate way to define a person's name.",
                  },
                },
              ],
            },
            {
              type: "TripleConstraint",
              predicate: "http://www.w3.org/2006/vcard/ns#hasAddress",
              valueExpr:
                "https://shaperepo.com/schemas/solidProfile#AddressShape",
              min: 0,
              max: -1,
              annotations: [
                {
                  type: "Annotation",
                  predicate: "http://www.w3.org/2000/01/rdf-schema#comment",
                  object: {
                    value: "The person's street address.",
                  },
                },
              ],
            },
            {
              type: "TripleConstraint",
              predicate: "http://www.w3.org/2006/vcard/ns#hasEmail",
              valueExpr:
                "https://shaperepo.com/schemas/solidProfile#EmailShape",
              min: 0,
              max: -1,
              annotations: [
                {
                  type: "Annotation",
                  predicate: "http://www.w3.org/2000/01/rdf-schema#comment",
                  object: {
                    value: "The person's email.",
                  },
                },
              ],
            },
            {
              type: "TripleConstraint",
              predicate: "http://www.w3.org/2006/vcard/ns#hasPhoto",
              valueExpr: {
                type: "NodeConstraint",
                nodeKind: "iri",
              },
              min: 0,
              max: 1,
              annotations: [
                {
                  type: "Annotation",
                  predicate: "http://www.w3.org/2000/01/rdf-schema#comment",
                  object: {
                    value: "A link to the person's photo",
                  },
                },
              ],
            },
            {
              type: "TripleConstraint",
              predicate: "http://xmlns.com/foaf/0.1/img",
              valueExpr: {
                type: "NodeConstraint",
                datatype: "http://www.w3.org/2001/XMLSchema#string",
              },
              min: 0,
              max: 1,
              annotations: [
                {
                  type: "Annotation",
                  predicate: "http://www.w3.org/2000/01/rdf-schema#comment",
                  object: {
                    value: "Photo link but in string form",
                  },
                },
              ],
            },
            {
              type: "TripleConstraint",
              predicate: "http://www.w3.org/2006/vcard/ns#hasTelephone",
              valueExpr:
                "https://shaperepo.com/schemas/solidProfile#PhoneNumberShape",
              min: 0,
              max: -1,
              annotations: [
                {
                  type: "Annotation",
                  predicate: "http://www.w3.org/2000/01/rdf-schema#comment",
                  object: {
                    value: "Person's telephone number",
                  },
                },
              ],
            },
            {
              type: "TripleConstraint",
              predicate: "http://www.w3.org/2006/vcard/ns#phone",
              valueExpr: {
                type: "NodeConstraint",
                datatype: "http://www.w3.org/2001/XMLSchema#string",
              },
              min: 0,
              max: 1,
              annotations: [
                {
                  type: "Annotation",
                  predicate: "http://www.w3.org/2000/01/rdf-schema#comment",
                  object: {
                    value:
                      "An alternative way to define a person's telephone number using a string",
                  },
                },
              ],
            },
            {
              type: "TripleConstraint",
              predicate: "http://www.w3.org/2006/vcard/ns#organization-name",
              valueExpr: {
                type: "NodeConstraint",
                datatype: "http://www.w3.org/2001/XMLSchema#string",
              },
              min: 0,
              max: 1,
              annotations: [
                {
                  type: "Annotation",
                  predicate: "http://www.w3.org/2000/01/rdf-schema#comment",
                  object: {
                    value:
                      "The name of the organization with which the person is affiliated",
                  },
                },
              ],
            },
            {
              type: "TripleConstraint",
              predicate: "http://www.w3.org/2006/vcard/ns#role",
              valueExpr: {
                type: "NodeConstraint",
                datatype: "http://www.w3.org/2001/XMLSchema#string",
              },
              min: 0,
              max: 1,
              annotations: [
                {
                  type: "Annotation",
                  predicate: "http://www.w3.org/2000/01/rdf-schema#comment",
                  object: {
                    value:
                      "The name of the person's role in their organization",
                  },
                },
              ],
            },
            {
              type: "TripleConstraint",
              predicate: "http://www.w3.org/ns/auth/acl#trustedApp",
              valueExpr:
                "https://shaperepo.com/schemas/solidProfile#TrustedAppShape",
              min: 0,
              max: -1,
              annotations: [
                {
                  type: "Annotation",
                  predicate: "http://www.w3.org/2000/01/rdf-schema#comment",
                  object: {
                    value:
                      "A list of app origins that are trusted by this user",
                  },
                },
              ],
            },
            {
              type: "TripleConstraint",
              predicate: "http://www.w3.org/ns/auth/cert#key",
              valueExpr:
                "https://shaperepo.com/schemas/solidProfile#RSAPublicKeyShape",
              min: 0,
              max: -1,
              annotations: [
                {
                  type: "Annotation",
                  predicate: "http://www.w3.org/2000/01/rdf-schema#comment",
                  object: {
                    value:
                      "A list of RSA public keys that are associated with private keys the user holds.",
                  },
                },
              ],
            },
            {
              type: "TripleConstraint",
              predicate: "http://www.w3.org/ns/ldp#inbox",
              valueExpr: {
                type: "NodeConstraint",
                nodeKind: "iri",
              },
              annotations: [
                {
                  type: "Annotation",
                  predicate: "http://www.w3.org/2000/01/rdf-schema#comment",
                  object: {
                    value:
                      "The user's LDP inbox to which apps can post notifications",
                  },
                },
              ],
            },
            {
              type: "TripleConstraint",
              predicate: "http://www.w3.org/ns/pim/space#preferencesFile",
              valueExpr: {
                type: "NodeConstraint",
                nodeKind: "iri",
              },
              min: 0,
              max: 1,
              annotations: [
                {
                  type: "Annotation",
                  predicate: "http://www.w3.org/2000/01/rdf-schema#comment",
                  object: {
                    value: "The user's preferences",
                  },
                },
              ],
            },
            {
              type: "TripleConstraint",
              predicate: "http://www.w3.org/ns/pim/space#storage",
              valueExpr: {
                type: "NodeConstraint",
                nodeKind: "iri",
              },
              min: 0,
              max: -1,
              annotations: [
                {
                  type: "Annotation",
                  predicate: "http://www.w3.org/2000/01/rdf-schema#comment",
                  object: {
                    value:
                      "The location of a Solid storage server related to this WebId",
                  },
                },
              ],
            },
            {
              type: "TripleConstraint",
              predicate: "http://www.w3.org/ns/solid/terms#account",
              valueExpr: {
                type: "NodeConstraint",
                nodeKind: "iri",
              },
              min: 0,
              max: 1,
              annotations: [
                {
                  type: "Annotation",
                  predicate: "http://www.w3.org/2000/01/rdf-schema#comment",
                  object: {
                    value: "The user's account",
                  },
                },
              ],
            },
            {
              type: "TripleConstraint",
              predicate: "http://www.w3.org/ns/solid/terms#privateTypeIndex",
              valueExpr: {
                type: "NodeConstraint",
                nodeKind: "iri",
              },
              min: 0,
              max: -1,
              annotations: [
                {
                  type: "Annotation",
                  predicate: "http://www.w3.org/2000/01/rdf-schema#comment",
                  object: {
                    value:
                      "A registry of all types used on the user's Pod (for private access only)",
                  },
                },
              ],
            },
            {
              type: "TripleConstraint",
              predicate: "http://www.w3.org/ns/solid/terms#publicTypeIndex",
              valueExpr: {
                type: "NodeConstraint",
                nodeKind: "iri",
              },
              min: 0,
              max: -1,
              annotations: [
                {
                  type: "Annotation",
                  predicate: "http://www.w3.org/2000/01/rdf-schema#comment",
                  object: {
                    value:
                      "A registry of all types used on the user's Pod (for public access)",
                  },
                },
              ],
            },
            {
              type: "TripleConstraint",
              predicate: "http://xmlns.com/foaf/0.1/knows",
              valueExpr:
                "https://shaperepo.com/schemas/solidProfile#SolidProfileShape",
              min: 0,
              max: -1,
              annotations: [
                {
                  type: "Annotation",
                  predicate: "http://www.w3.org/2000/01/rdf-schema#comment",
                  object: {
                    value:
                      "A list of WebIds for all the people this user knows.",
                  },
                },
              ],
            },
          ],
        },
        extra: ["http://www.w3.org/1999/02/22-rdf-syntax-ns#type"],
      },
    },
    {
      id: "https://shaperepo.com/schemas/solidProfile#AddressShape",
      type: "ShapeDecl",
      shapeExpr: {
        type: "Shape",
        expression: {
          type: "EachOf",
          expressions: [
            {
              type: "TripleConstraint",
              predicate: "http://www.w3.org/2006/vcard/ns#country-name",
              valueExpr: {
                type: "NodeConstraint",
                datatype: "http://www.w3.org/2001/XMLSchema#string",
              },
              min: 0,
              max: 1,
              annotations: [
                {
                  type: "Annotation",
                  predicate: "http://www.w3.org/2000/01/rdf-schema#comment",
                  object: {
                    value: "The name of the user's country of residence",
                  },
                },
              ],
            },
            {
              type: "TripleConstraint",
              predicate: "http://www.w3.org/2006/vcard/ns#locality",
              valueExpr: {
                type: "NodeConstraint",
                datatype: "http://www.w3.org/2001/XMLSchema#string",
              },
              min: 0,
              max: 1,
              annotations: [
                {
                  type: "Annotation",
                  predicate: "http://www.w3.org/2000/01/rdf-schema#comment",
                  object: {
                    value:
                      "The name of the user's locality (City, Town etc.) of residence",
                  },
                },
              ],
            },
            {
              type: "TripleConstraint",
              predicate: "http://www.w3.org/2006/vcard/ns#postal-code",
              valueExpr: {
                type: "NodeConstraint",
                datatype: "http://www.w3.org/2001/XMLSchema#string",
              },
              min: 0,
              max: 1,
              annotations: [
                {
                  type: "Annotation",
                  predicate: "http://www.w3.org/2000/01/rdf-schema#comment",
                  object: {
                    value: "The user's postal code",
                  },
                },
              ],
            },
            {
              type: "TripleConstraint",
              predicate: "http://www.w3.org/2006/vcard/ns#region",
              valueExpr: {
                type: "NodeConstraint",
                datatype: "http://www.w3.org/2001/XMLSchema#string",
              },
              min: 0,
              max: 1,
              annotations: [
                {
                  type: "Annotation",
                  predicate: "http://www.w3.org/2000/01/rdf-schema#comment",
                  object: {
                    value:
                      "The name of the user's region (State, Province etc.) of residence",
                  },
                },
              ],
            },
            {
              type: "TripleConstraint",
              predicate: "http://www.w3.org/2006/vcard/ns#street-address",
              valueExpr: {
                type: "NodeConstraint",
                datatype: "http://www.w3.org/2001/XMLSchema#string",
              },
              min: 0,
              max: 1,
              annotations: [
                {
                  type: "Annotation",
                  predicate: "http://www.w3.org/2000/01/rdf-schema#comment",
                  object: {
                    value: "The user's street address",
                  },
                },
              ],
            },
          ],
        },
      },
    },
    {
      id: "https://shaperepo.com/schemas/solidProfile#EmailShape",
      type: "ShapeDecl",
      shapeExpr: {
        type: "Shape",
        expression: {
          type: "EachOf",
          expressions: [
            {
              type: "TripleConstraint",
              predicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
              valueExpr: {
                type: "NodeConstraint",
                values: [
                  "http://www.w3.org/2006/vcard/ns#Dom",
                  "http://www.w3.org/2006/vcard/ns#Home",
                  "http://www.w3.org/2006/vcard/ns#ISDN",
                  "http://www.w3.org/2006/vcard/ns#Internet",
                  "http://www.w3.org/2006/vcard/ns#Intl",
                  "http://www.w3.org/2006/vcard/ns#Label",
                  "http://www.w3.org/2006/vcard/ns#Parcel",
                  "http://www.w3.org/2006/vcard/ns#Postal",
                  "http://www.w3.org/2006/vcard/ns#Pref",
                  "http://www.w3.org/2006/vcard/ns#Work",
                  "http://www.w3.org/2006/vcard/ns#X400",
                ],
              },
              min: 0,
              max: 1,
              annotations: [
                {
                  type: "Annotation",
                  predicate: "http://www.w3.org/2000/01/rdf-schema#comment",
                  object: {
                    value: "The type of email.",
                  },
                },
              ],
            },
            {
              type: "TripleConstraint",
              predicate: "http://www.w3.org/2006/vcard/ns#value",
              valueExpr: {
                type: "NodeConstraint",
                nodeKind: "iri",
              },
              annotations: [
                {
                  type: "Annotation",
                  predicate: "http://www.w3.org/2000/01/rdf-schema#comment",
                  object: {
                    value:
                      "The value of an email as a mailto link (Example <mailto:jane@example.com>)",
                  },
                },
              ],
            },
          ],
        },
        extra: ["http://www.w3.org/1999/02/22-rdf-syntax-ns#type"],
      },
    },
    {
      id: "https://shaperepo.com/schemas/solidProfile#PhoneNumberShape",
      type: "ShapeDecl",
      shapeExpr: {
        type: "Shape",
        expression: {
          type: "EachOf",
          expressions: [
            {
              type: "TripleConstraint",
              predicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
              valueExpr: {
                type: "NodeConstraint",
                values: [
                  "http://www.w3.org/2006/vcard/ns#Dom",
                  "http://www.w3.org/2006/vcard/ns#Home",
                  "http://www.w3.org/2006/vcard/ns#ISDN",
                  "http://www.w3.org/2006/vcard/ns#Internet",
                  "http://www.w3.org/2006/vcard/ns#Intl",
                  "http://www.w3.org/2006/vcard/ns#Label",
                  "http://www.w3.org/2006/vcard/ns#Parcel",
                  "http://www.w3.org/2006/vcard/ns#Postal",
                  "http://www.w3.org/2006/vcard/ns#Pref",
                  "http://www.w3.org/2006/vcard/ns#Work",
                  "http://www.w3.org/2006/vcard/ns#X400",
                ],
              },
              min: 0,
              max: 1,
              annotations: [
                {
                  type: "Annotation",
                  predicate: "http://www.w3.org/2000/01/rdf-schema#comment",
                  object: {
                    value: "They type of Phone Number",
                  },
                },
              ],
            },
            {
              type: "TripleConstraint",
              predicate: "http://www.w3.org/2006/vcard/ns#value",
              valueExpr: {
                type: "NodeConstraint",
                nodeKind: "iri",
              },
              annotations: [
                {
                  type: "Annotation",
                  predicate: "http://www.w3.org/2000/01/rdf-schema#comment",
                  object: {
                    value:
                      "The value of a phone number as a tel link (Example <tel:555-555-5555>)",
                  },
                },
              ],
            },
          ],
        },
        extra: ["http://www.w3.org/1999/02/22-rdf-syntax-ns#type"],
      },
    },
    {
      id: "https://shaperepo.com/schemas/solidProfile#TrustedAppShape",
      type: "ShapeDecl",
      shapeExpr: {
        type: "Shape",
        expression: {
          type: "EachOf",
          expressions: [
            {
              type: "TripleConstraint",
              predicate: "http://www.w3.org/ns/auth/acl#mode",
              valueExpr: {
                type: "NodeConstraint",
                values: [
                  "http://www.w3.org/ns/auth/acl#Append",
                  "http://www.w3.org/ns/auth/acl#Control",
                  "http://www.w3.org/ns/auth/acl#Read",
                  "http://www.w3.org/ns/auth/acl#Write",
                ],
              },
              min: 1,
              max: -1,
              annotations: [
                {
                  type: "Annotation",
                  predicate: "http://www.w3.org/2000/01/rdf-schema#comment",
                  object: {
                    value: "The level of access provided to this origin",
                  },
                },
              ],
            },
            {
              type: "TripleConstraint",
              predicate: "http://www.w3.org/ns/auth/acl#origin",
              valueExpr: {
                type: "NodeConstraint",
                nodeKind: "iri",
              },
              annotations: [
                {
                  type: "Annotation",
                  predicate: "http://www.w3.org/2000/01/rdf-schema#comment",
                  object: {
                    value: "The app origin the user trusts",
                  },
                },
              ],
            },
          ],
        },
      },
    },
    {
      id: "https://shaperepo.com/schemas/solidProfile#RSAPublicKeyShape",
      type: "ShapeDecl",
      shapeExpr: {
        type: "Shape",
        expression: {
          type: "EachOf",
          expressions: [
            {
              type: "TripleConstraint",
              predicate: "http://www.w3.org/ns/auth/cert#modulus",
              valueExpr: {
                type: "NodeConstraint",
                datatype: "http://www.w3.org/2001/XMLSchema#string",
              },
              annotations: [
                {
                  type: "Annotation",
                  predicate: "http://www.w3.org/2000/01/rdf-schema#comment",
                  object: {
                    value: "RSA Modulus",
                  },
                },
              ],
            },
            {
              type: "TripleConstraint",
              predicate: "http://www.w3.org/ns/auth/cert#exponent",
              valueExpr: {
                type: "NodeConstraint",
                datatype: "http://www.w3.org/2001/XMLSchema#integer",
              },
              annotations: [
                {
                  type: "Annotation",
                  predicate: "http://www.w3.org/2000/01/rdf-schema#comment",
                  object: {
                    value: "RSA Exponent",
                  },
                },
              ],
            },
          ],
        },
      },
    },
  ],
};

export const profileContext: ContextDefinition = {
  countryName: {
    "@id": "http://www.w3.org/2006/vcard/ns#country-name",
    "@type": "http://www.w3.org/2001/XMLSchema#string",
  },
  locality: {
    "@id": "http://www.w3.org/2006/vcard/ns#locality",
    "@type": "http://www.w3.org/2001/XMLSchema#string",
  },
  postalCode: {
    "@id": "http://www.w3.org/2006/vcard/ns#postal-code",
    "@type": "http://www.w3.org/2001/XMLSchema#string",
  },
  region: {
    "@id": "http://www.w3.org/2006/vcard/ns#region",
    "@type": "http://www.w3.org/2001/XMLSchema#string",
  },
  streetAddress: {
    "@id": "http://www.w3.org/2006/vcard/ns#street-address",
    "@type": "http://www.w3.org/2001/XMLSchema#string",
  },
  type: {
    "@id": "@type",
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
  value: {
    "@id": "http://www.w3.org/2006/vcard/ns#value",
    "@container": "@set",
  },
  modulus: {
    "@id": "http://www.w3.org/ns/auth/cert#modulus",
    "@type": "http://www.w3.org/2001/XMLSchema#string",
  },
  exponent: {
    "@id": "http://www.w3.org/ns/auth/cert#exponent",
    "@type": "http://www.w3.org/2001/XMLSchema#integer",
  },
  Person: "http://schema.org/Person",
  Person2: "http://xmlns.com/foaf/0.1/Person",
  fn: {
    "@id": "http://www.w3.org/2006/vcard/ns#fn",
    "@type": "http://www.w3.org/2001/XMLSchema#string",
  },
  name: {
    "@id": "http://xmlns.com/foaf/0.1/name",
    "@type": "http://www.w3.org/2001/XMLSchema#string",
  },
  hasAddress: {
    "@id": "http://www.w3.org/2006/vcard/ns#hasAddress",
    "@type": "@id",
    "@container": "@set",
  },
  hasEmail: {
    "@id": "http://www.w3.org/2006/vcard/ns#hasEmail",
    "@type": "@id",
    "@container": "@set",
  },
  hasPhoto: {
    "@id": "http://www.w3.org/2006/vcard/ns#hasPhoto",
  },
  img: {
    "@id": "http://xmlns.com/foaf/0.1/img",
    "@type": "http://www.w3.org/2001/XMLSchema#string",
  },
  hasTelephone: {
    "@id": "http://www.w3.org/2006/vcard/ns#hasTelephone",
    "@type": "@id",
    "@container": "@set",
  },
  phone: {
    "@id": "http://www.w3.org/2006/vcard/ns#phone",
    "@type": "http://www.w3.org/2001/XMLSchema#string",
  },
  organizationName: {
    "@id": "http://www.w3.org/2006/vcard/ns#organization-name",
    "@type": "http://www.w3.org/2001/XMLSchema#string",
  },
  role: {
    "@id": "http://www.w3.org/2006/vcard/ns#role",
    "@type": "http://www.w3.org/2001/XMLSchema#string",
  },
  trustedApp: {
    "@id": "http://www.w3.org/ns/auth/acl#trustedApp",
    "@type": "@id",
    "@container": "@set",
  },
  mode: {
    "@id": "http://www.w3.org/ns/auth/acl#mode",
    "@container": "@set",
  },
  Append: "http://www.w3.org/ns/auth/acl#Append",
  Control: "http://www.w3.org/ns/auth/acl#Control",
  Read: "http://www.w3.org/ns/auth/acl#Read",
  Write: "http://www.w3.org/ns/auth/acl#Write",
  origin: {
    "@id": "http://www.w3.org/ns/auth/acl#origin",
  },
  key: {
    "@id": "http://www.w3.org/ns/auth/cert#key",
    "@type": "@id",
    "@container": "@set",
  },
  inbox: {
    "@id": "http://www.w3.org/ns/ldp#inbox",
    "@type": "@id",
  },
  preferencesFile: {
    "@id": "http://www.w3.org/ns/pim/space#preferencesFile",
  },
  storage: {
    "@id": "http://www.w3.org/ns/pim/space#storage",
    "@container": "@set",
  },
  account: {
    "@id": "http://www.w3.org/ns/solid/terms#account",
  },
  privateTypeIndex: {
    "@id": "http://www.w3.org/ns/solid/terms#privateTypeIndex",
    "@container": "@set",
  },
  publicTypeIndex: {
    "@id": "http://www.w3.org/ns/solid/terms#publicTypeIndex",
    "@container": "@set",
  },
  knows: {
    "@id": "http://xmlns.com/foaf/0.1/knows",
    "@container": "@set",
  },
};

/**
 * RDF/JS Wrapper classes for the Solid Profile ShEx shape.
 *
 * Cardinality mapping used throughout:
 *   - ShEx `min 0, max 1`        -> optional singular  (OptionalFrom / OptionalAs)
 *   - ShEx no min/max (= 1..1)   -> required singular  (RequiredFrom / RequiredAs)
 *   - ShEx `max -1` (unbounded)  -> set / "multiple"   (SetFrom -> mutable Set)
 *
 * Value/term mappings:
 *   - xsd:string  -> LiteralAs.string  / LiteralFrom.string
 *   - xsd:integer -> LiteralAs.number  / LiteralFrom.integer
 *   - IRI (nodeKind: iri) -> NamedNodeAs.string / NamedNodeFrom.string  (IRI as a JS string)
 *   - nested shape        -> TermAs.instance(Class) / TermFrom.instance
 */

// ---------------------------------------------------------------------------
// Vocabulary / predicate IRIs
// ---------------------------------------------------------------------------

const RDF = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
const FOAF = "http://xmlns.com/foaf/0.1/";
const VCARD = "http://www.w3.org/2006/vcard/ns#";
const ACL = "http://www.w3.org/ns/auth/acl#";
const CERT = "http://www.w3.org/ns/auth/cert#";
const LDP = "http://www.w3.org/ns/ldp#";
const PIM = "http://www.w3.org/ns/pim/space#";
const SOLID = "http://www.w3.org/ns/solid/terms#";

// ---------------------------------------------------------------------------
// AddressShape  -> all five fields are optional strings
// ---------------------------------------------------------------------------

export class Address extends LdoTermWrapper {
  get countryName(): string | undefined {
    return OptionalFrom.subjectPredicate(
      this,
      VCARD + "country-name",
      LiteralAs.string,
    );
  }
  set countryName(value: string | undefined) {
    OptionalAs.object(this, VCARD + "country-name", value, LiteralFrom.string);
  }

  get locality(): string | undefined {
    return OptionalFrom.subjectPredicate(
      this,
      VCARD + "locality",
      LiteralAs.string,
    );
  }
  set locality(value: string | undefined) {
    OptionalAs.object(this, VCARD + "locality", value, LiteralFrom.string);
  }

  get postalCode(): string | undefined {
    return OptionalFrom.subjectPredicate(
      this,
      VCARD + "postal-code",
      LiteralAs.string,
    );
  }
  set postalCode(value: string | undefined) {
    OptionalAs.object(this, VCARD + "postal-code", value, LiteralFrom.string);
  }

  get region(): string | undefined {
    return OptionalFrom.subjectPredicate(
      this,
      VCARD + "region",
      LiteralAs.string,
    );
  }
  set region(value: string | undefined) {
    OptionalAs.object(this, VCARD + "region", value, LiteralFrom.string);
  }

  get streetAddress(): string | undefined {
    return OptionalFrom.subjectPredicate(
      this,
      VCARD + "street-address",
      LiteralAs.string,
    );
  }
  set streetAddress(value: string | undefined) {
    OptionalAs.object(
      this,
      VCARD + "street-address",
      value,
      LiteralFrom.string,
    );
  }
}

// ---------------------------------------------------------------------------
// EmailShape  -> optional `type` (IRI kind) + required `value` (mailto IRI)
// ---------------------------------------------------------------------------

export class Email extends LdoTermWrapper {
  /** vcard kind, e.g. vcard:Home / vcard:Work (IRI). */
  get kind(): string | undefined {
    return OptionalFrom.subjectPredicate(
      this,
      RDF + "type",
      NamedNodeAs.string,
    );
  }
  set kind(value: string | undefined) {
    OptionalAs.object(this, RDF + "type", value, NamedNodeFrom.string);
  }

  /** The email as a mailto: IRI (required). */
  get value(): string {
    return RequiredFrom.subjectPredicate(
      this,
      VCARD + "value",
      NamedNodeAs.string,
    );
  }
  set value(value: string) {
    RequiredAs.object(this, VCARD + "value", value, NamedNodeFrom.string);
  }
}

// ---------------------------------------------------------------------------
// PhoneNumberShape  -> optional `type` (IRI kind) + required `value` (tel IRI)
// ---------------------------------------------------------------------------

export class PhoneNumber extends LdoTermWrapper {
  get kind(): string | undefined {
    return OptionalFrom.subjectPredicate(
      this,
      RDF + "type",
      NamedNodeAs.string,
    );
  }
  set kind(value: string | undefined) {
    OptionalAs.object(this, RDF + "type", value, NamedNodeFrom.string);
  }

  /** The phone number as a tel: IRI (required). */
  get value(): string {
    return RequiredFrom.subjectPredicate(
      this,
      VCARD + "value",
      NamedNodeAs.string,
    );
  }
  set value(value: string) {
    RequiredAs.object(this, VCARD + "value", value, NamedNodeFrom.string);
  }
}

// ---------------------------------------------------------------------------
// TrustedAppShape  -> set of acl:mode IRIs (min 1) + required acl:origin IRI
// ---------------------------------------------------------------------------

export class TrustedApp extends LdoTermWrapper {
  /** Access modes (acl:Read / acl:Write / acl:Append / acl:Control). 1..* */
  get modes(): Set<string> {
    return SetFrom.subjectPredicate(
      this,
      ACL + "mode",
      NamedNodeAs.string,
      NamedNodeFrom.string,
    );
  }

  /** The trusted app origin (required IRI). */
  get origin(): string {
    return RequiredFrom.subjectPredicate(
      this,
      ACL + "origin",
      NamedNodeAs.string,
    );
  }
  set origin(value: string) {
    RequiredAs.object(this, ACL + "origin", value, NamedNodeFrom.string);
  }
}

// ---------------------------------------------------------------------------
// RSAPublicKeyShape  -> required modulus (string) + required exponent (integer)
// ---------------------------------------------------------------------------

export class RSAPublicKey extends LdoTermWrapper {
  get modulus(): string {
    return RequiredFrom.subjectPredicate(
      this,
      CERT + "modulus",
      LiteralAs.string,
    );
  }
  set modulus(value: string) {
    RequiredAs.object(this, CERT + "modulus", value, LiteralFrom.string);
  }

  get exponent(): number {
    return RequiredFrom.subjectPredicate(
      this,
      CERT + "exponent",
      LiteralAs.number,
    );
  }
  set exponent(value: number) {
    RequiredAs.object(this, CERT + "exponent", value, LiteralFrom.integer);
  }
}

// ---------------------------------------------------------------------------
// SolidProfileShape
// ---------------------------------------------------------------------------

export class SolidProfile extends LdoTermWrapper {
  // --- rdf:type values (schema:Person, foaf:Person, ...) as a mutable set ---
  get types(): Set<string> {
    return SetFrom.subjectPredicate(
      this,
      RDF + "type",
      NamedNodeAs.string,
      NamedNodeFrom.string,
    );
  }

  // --- Optional singular strings (min 0, max 1) ---
  get fn(): string | undefined {
    return OptionalFrom.subjectPredicate(this, VCARD + "fn", LiteralAs.string);
  }
  set fn(value: string | undefined) {
    OptionalAs.object(this, VCARD + "fn", value, LiteralFrom.string);
  }

  get name(): string | undefined {
    return OptionalFrom.subjectPredicate(this, FOAF + "name", LiteralAs.string);
  }
  set name(value: string | undefined) {
    OptionalAs.object(this, FOAF + "name", value, LiteralFrom.string);
  }

  /** foaf:img — photo as a plain string literal. */
  get img(): string | undefined {
    return OptionalFrom.subjectPredicate(this, FOAF + "img", LiteralAs.string);
  }
  set img(value: string | undefined) {
    OptionalAs.object(this, FOAF + "img", value, LiteralFrom.string);
  }

  get phone(): string | undefined {
    return OptionalFrom.subjectPredicate(
      this,
      VCARD + "phone",
      LiteralAs.string,
    );
  }
  set phone(value: string | undefined) {
    OptionalAs.object(this, VCARD + "phone", value, LiteralFrom.string);
  }

  get organizationName(): string | undefined {
    return OptionalFrom.subjectPredicate(
      this,
      VCARD + "organization-name",
      LiteralAs.string,
    );
  }
  set organizationName(value: string | undefined) {
    OptionalAs.object(
      this,
      VCARD + "organization-name",
      value,
      LiteralFrom.string,
    );
  }

  get role(): string | undefined {
    return OptionalFrom.subjectPredicate(
      this,
      VCARD + "role",
      LiteralAs.string,
    );
  }
  set role(value: string | undefined) {
    OptionalAs.object(this, VCARD + "role", value, LiteralFrom.string);
  }

  // --- Optional singular IRIs (min 0, max 1) ---
  get hasPhoto(): string | undefined {
    return OptionalFrom.subjectPredicate(
      this,
      VCARD + "hasPhoto",
      NamedNodeAs.string,
    );
  }
  set hasPhoto(value: string | undefined) {
    OptionalAs.object(this, VCARD + "hasPhoto", value, NamedNodeFrom.string);
  }

  get preferencesFile(): string | undefined {
    return OptionalFrom.subjectPredicate(
      this,
      PIM + "preferencesFile",
      NamedNodeAs.string,
    );
  }
  set preferencesFile(value: string | undefined) {
    OptionalAs.object(
      this,
      PIM + "preferencesFile",
      value,
      NamedNodeFrom.string,
    );
  }

  get account(): string | undefined {
    return OptionalFrom.subjectPredicate(
      this,
      SOLID + "account",
      NamedNodeAs.string,
    );
  }
  set account(value: string | undefined) {
    OptionalAs.object(this, SOLID + "account", value, NamedNodeFrom.string);
  }

  // --- Required singular IRI (no min/max in shape => 1..1) ---
  get inbox(): string {
    return RequiredFrom.subjectPredicate(
      this,
      LDP + "inbox",
      NamedNodeAs.string,
    );
  }
  set inbox(value: string) {
    RequiredAs.object(this, LDP + "inbox", value, NamedNodeFrom.string);
  }

  // --- Sets of IRIs (max -1) ---
  get storage(): Set<string> {
    return SetFrom.subjectPredicate(
      this,
      PIM + "storage",
      NamedNodeAs.string,
      NamedNodeFrom.string,
    );
  }

  get privateTypeIndex(): Set<string> {
    return SetFrom.subjectPredicate(
      this,
      SOLID + "privateTypeIndex",
      NamedNodeAs.string,
      NamedNodeFrom.string,
    );
  }

  get publicTypeIndex(): Set<string> {
    return SetFrom.subjectPredicate(
      this,
      SOLID + "publicTypeIndex",
      NamedNodeAs.string,
      NamedNodeFrom.string,
    );
  }

  // --- Sets of nested wrappers (max -1) ---
  get addresses(): Set<Address> {
    return SetFrom.subjectPredicate(
      this,
      VCARD + "hasAddress",
      TermAs.instance(Address),
      TermFrom.instance,
    );
  }

  get emails(): Set<Email> {
    return SetFrom.subjectPredicate(
      this,
      VCARD + "hasEmail",
      TermAs.instance(Email),
      TermFrom.instance,
    );
  }

  get phones(): Set<PhoneNumber> {
    return SetFrom.subjectPredicate(
      this,
      VCARD + "hasTelephone",
      TermAs.instance(PhoneNumber),
      TermFrom.instance,
    );
  }

  get trustedApps(): Set<TrustedApp> {
    return SetFrom.subjectPredicate(
      this,
      ACL + "trustedApp",
      TermAs.instance(TrustedApp),
      TermFrom.instance,
    );
  }

  get keys(): Set<RSAPublicKey> {
    return SetFrom.subjectPredicate(
      this,
      CERT + "key",
      TermAs.instance(RSAPublicKey),
      TermFrom.instance,
    );
  }

  /** foaf:knows — other Solid profiles (recursive). */
  get knows(): Set<SolidProfile> {
    return SetFrom.subjectPredicate(
      this,
      FOAF + "knows",
      TermAs.instance(SolidProfile),
      TermFrom.instance,
    );
  }
}
