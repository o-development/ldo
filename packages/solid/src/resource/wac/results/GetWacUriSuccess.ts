import type { ResourceSuccess } from "../../../requester/results/success/SuccessResult";

export interface GetWacUriSuccess extends ResourceSuccess {
  type: "getWacUriSuccess";
  wacUri: string;
}
