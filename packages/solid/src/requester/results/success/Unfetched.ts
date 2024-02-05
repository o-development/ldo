import type { ResourceSuccess } from "./SuccessResult";

/**
 * Indicates that a specific resource is unfetched
 */
export interface Unfetched extends ResourceSuccess {
  type: "unfetched";
}
