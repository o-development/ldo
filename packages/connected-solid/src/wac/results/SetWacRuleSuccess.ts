import type { ResourceSuccess } from "../../../requester/results/success/SuccessResult";
import type { WacRule } from "../WacRule";

/**
 * Returned when rules were successfully written
 */
export interface SetWacRuleSuccess extends ResourceSuccess {
  type: "setWacRuleSuccess";
  /**
   * The written rule
   */
  wacRule: WacRule;
}
