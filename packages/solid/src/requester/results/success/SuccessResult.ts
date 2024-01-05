import type { RequesterResult } from "../RequesterResult";

/**
 * Indicates that some action taken by LDO was a success
 */
export interface SuccessResult extends RequesterResult {
  isError: false;
}

/**
 * Indicates that a request to a resource was aa success
 */
export interface ResourceSuccess extends SuccessResult {
  /**
   * The URI of the resource
   */
  uri: string;
}

/**
 * A grouping of multiple successes as a result of an action
 */
export interface AggregateSuccess<SuccessType extends SuccessResult>
  extends SuccessResult {
  type: "aggregateSuccess";

  /**
   * An array of all successesses
   */
  results: SuccessType[];
}
