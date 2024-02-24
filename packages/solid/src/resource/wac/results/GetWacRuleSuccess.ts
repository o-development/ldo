import type { ResourceSuccess } from "../../../requester/results/success/SuccessResult";
import type { WacRule } from "../WacRule";

/**
 * Returned when a WAC rule is successfully retrieved
 */
export interface GetWacRuleSuccess extends ResourceSuccess {
  type: "getWacRuleSuccess";
  /**
   * The rule that was retrieved
   */
  wacRule: WacRule;
}
