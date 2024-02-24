import { ContextDefinition } from "jsonld";

/**
 * =============================================================================
 * wacContext: JSONLD Context for wac
 * =============================================================================
 */
export const wacContext: ContextDefinition = {
  type: {
    "@id": "@type",
  },
  Authorization: "http://www.w3.org/ns/auth/acl#Authorization",
  accessTo: {
    "@id": "http://www.w3.org/ns/auth/acl#accessTo",
    "@type": "@id",
  },
  default: {
    "@id": "http://www.w3.org/ns/auth/acl#default",
    "@type": "@id",
  },
  agent: {
    "@id": "http://www.w3.org/ns/auth/acl#agent",
    "@type": "@id",
    "@container": "@set",
  },
  agentGroup: {
    "@id": "http://www.w3.org/ns/auth/acl#agentGroup",
    "@type": "@id",
    "@container": "@set",
  },
  agentClass: {
    "@id": "http://www.w3.org/ns/auth/acl#agentClass",
    "@container": "@set",
  },
  AuthenticatedAgent: "http://www.w3.org/ns/auth/acl#AuthenticatedAgent",
  Agent: "http://xmlns.com/foaf/0.1/Agent",
  mode: {
    "@id": "http://www.w3.org/ns/auth/acl#mode",
    "@container": "@set",
  },
  Read: "http://www.w3.org/ns/auth/acl#Read",
  Write: "http://www.w3.org/ns/auth/acl#Write",
  Append: "http://www.w3.org/ns/auth/acl#Append",
  Control: "http://www.w3.org/ns/auth/acl#Control",
};
