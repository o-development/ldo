import type { ResourceSuccess } from "./SuccessResult";

/**
 * Indicates that the request to create the resource was a success.
 */
export interface CreateSuccess extends ResourceSuccess {
  type: "createSuccess";
  /**
   * True if there was a resource that existed before at the given URI that was
   * overwritten
   */
  didOverwrite: boolean;
}
