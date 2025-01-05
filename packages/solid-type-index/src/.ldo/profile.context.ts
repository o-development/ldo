import { ContextDefinition } from "jsonld";

/**
 * =============================================================================
 * profileContext: JSONLD Context for profile
 * =============================================================================
 */
export const profileContext: ContextDefinition = {
  privateTypeIndex: {
    "@id": "http://www.w3.org/ns/solid/terms#privateTypeIndex",
    "@type": "@id",
    "@isCollection": true,
  },
  publicTypeIndex: {
    "@id": "http://www.w3.org/ns/solid/terms#publicTypeIndex",
    "@type": "@id",
    "@isCollection": true,
  },
};
