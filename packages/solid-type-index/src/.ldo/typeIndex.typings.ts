import { ContextDefinition } from "jsonld";

/**
 * =============================================================================
 * Typescript Typings for typeIndex
 * =============================================================================
 */

/**
 * TypeIndexDocument Type
 */
export interface TypeIndexDocument {
  "@id"?: string;
  "@context"?: ContextDefinition;
  /**
   * Defines the node as a TypeIndex | Defines the node as a Listed Document
   */
  type: (
    | {
        "@id": "TypeIndex";
      }
    | {
        "@id": "ListedDocument";
      }
  )[];
}

/**
 * TypeRegistration Type
 */
export interface TypeRegistration {
  "@id"?: string;
  "@context"?: ContextDefinition;
  /**
   * Defines this node as a Type Registration
   */
  type: {
    "@id": "TypeRegistration";
  };
  /**
   * The class of object at this type.
   */
  forClass: {
    "@id": string;
  };
  /**
   * A specific resource that contains the class.
   */
  instance?: {
    "@id": string;
  }[];
  /**
   * Containers that contain resources with the class.
   */
  instanceContainer?: {
    "@id": string;
  }[];
}
