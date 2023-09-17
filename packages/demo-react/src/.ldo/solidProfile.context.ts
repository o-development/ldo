import { ContextDefinition } from "jsonld";

/**
 * =============================================================================
 * solidProfileContext: JSONLD Context for solidProfile
 * =============================================================================
 */
export const solidProfileContext: ContextDefinition = {
  type: {
    "@id": "@type",
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
  value: {
    "@id": "http://www.w3.org/2006/vcard/ns#value",
    "@type": "@id",
  },
  hasPhoto: {
    "@id": "http://www.w3.org/2006/vcard/ns#hasPhoto",
    "@type": "@id",
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
    "@type": "@id",
  },
  key: {
    "@id": "http://www.w3.org/ns/auth/cert#key",
    "@type": "@id",
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
  inbox: {
    "@id": "http://www.w3.org/ns/ldp#inbox",
    "@type": "@id",
  },
  preferencesFile: {
    "@id": "http://www.w3.org/ns/pim/space#preferencesFile",
    "@type": "@id",
  },
  storage: {
    "@id": "http://www.w3.org/ns/pim/space#storage",
    "@type": "@id",
    "@container": "@set",
  },
  account: {
    "@id": "http://www.w3.org/ns/solid/terms#account",
    "@type": "@id",
  },
  privateTypeIndex: {
    "@id": "http://www.w3.org/ns/solid/terms#privateTypeIndex",
    "@type": "@id",
    "@container": "@set",
  },
  publicTypeIndex: {
    "@id": "http://www.w3.org/ns/solid/terms#publicTypeIndex",
    "@type": "@id",
    "@container": "@set",
  },
  knows: {
    "@id": "http://xmlns.com/foaf/0.1/knows",
    "@type": "@id",
    "@container": "@set",
  },
};
