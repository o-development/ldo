import { ContextDefinition } from "jsonld";

/**
 * =============================================================================
 * Typescript Typings for profile
 * =============================================================================
 */

/**
 * TypeIndexProfile Type
 */
export interface TypeIndexProfile {
  "@id"?: string;
  "@context"?: ContextDefinition;
  /**
   * A registry of all types used on the user's Pod (for private access only)
   */
  privateTypeIndex?: {
    "@id": string;
  }[];
  /**
   * A registry of all types used on the user's Pod (for public access)
   */
  publicTypeIndex?: {
    "@id": string;
  }[];
}
