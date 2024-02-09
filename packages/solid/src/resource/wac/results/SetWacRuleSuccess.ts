import type { ResourceSuccess } from "../../../requester/results/success/SuccessResult";
import type { WacRule } from "../WacRule";

export interface SetWacRuleSuccess extends ResourceSuccess {
  type: "setWacRuleSuccess";
  wacRule: WacRule;
}
