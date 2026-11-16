import type { LdoJsonldContext } from "@ldo/ldo";

/**
 * =============================================================================
 * foafProfileContext: JSONLD Context for foafProfile
 * =============================================================================
 */
export const foafProfileContext: LdoJsonldContext = {
  type: {
    "@id": "@type",
    "@isCollection": true,
  },
  Person: {
    "@id": "http://xmlns.com/foaf/0.1/Person",
    "@context": {
      type: {
        "@id": "@type",
        "@isCollection": true,
      },
      name: {
        "@id": "http://xmlns.com/foaf/0.1/name",
        "@type": "http://www.w3.org/2001/XMLSchema#string",
      },
      img: {
        "@id": "http://xmlns.com/foaf/0.1/img",
        "@type": "http://www.w3.org/2001/XMLSchema#string",
      },
      knows: {
        "@id": "http://xmlns.com/foaf/0.1/knows",
        "@type": "@id",
        "@isCollection": true,
      },
    },
  },
  name: {
    "@id": "http://xmlns.com/foaf/0.1/name",
    "@type": "http://www.w3.org/2001/XMLSchema#string",
  },
  img: {
    "@id": "http://xmlns.com/foaf/0.1/img",
    "@type": "http://www.w3.org/2001/XMLSchema#string",
  },
  knows: {
    "@id": "http://xmlns.com/foaf/0.1/knows",
    "@type": "@id",
    "@isCollection": true,
  },
};
