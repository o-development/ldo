import type { ResourceSuccess } from "../../../requester/results/success/SuccessResult";
import type { LeafUri } from "../../../util/uriTypes";

export interface GetWacUriSuccess extends ResourceSuccess {
  type: "getWacUriSuccess";
  wacUri: LeafUri;
}
