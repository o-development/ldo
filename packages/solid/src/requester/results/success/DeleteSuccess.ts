import type { ResourceSuccess } from "./SuccessResult";

/**
 * Indicates that the request to delete a resource was a success.
 */
export interface DeleteSuccess extends ResourceSuccess {
  type: "deleteSuccess";

  /**
   * True if there was a resource at the provided URI that was deleted. False if
   * a resource didn't exist.
   */
  resourceExisted: boolean;
}
