import type { ResourceSuccess } from "../../../requester/results/success/SuccessResult";

export interface WacRuleAbsent extends ResourceSuccess {
  type: "wacRuleAbsent";
}
