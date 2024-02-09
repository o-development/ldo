import type { ResourceSuccess } from "../../../requester/results/success/SuccessResult";
import type { WacRule } from "../WacRule";

export interface GetWacRuleSuccess extends ResourceSuccess {
  type: "getWacRuleSuccess";
  wacRule: WacRule;
}
