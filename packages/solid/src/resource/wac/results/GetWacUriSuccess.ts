import type { ResourceSuccess } from "../../../requester/results/success/SuccessResult";
import type { LeafUri } from "../../../util/uriTypes";

/**
 * Returned when the URI for a resources ACL document was successfully retried
 */
export interface GetWacUriSuccess extends ResourceSuccess {
  type: "getWacUriSuccess";
  /**
   * The URI of the ACL document
   */
  wacUri: LeafUri;
}
