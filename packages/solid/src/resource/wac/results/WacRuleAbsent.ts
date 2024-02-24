import type { ResourceSuccess } from "../../../requester/results/success/SuccessResult";

/**
 * Returned if no WAC rule was returned from the server
 */
export interface WacRuleAbsent extends ResourceSuccess {
  type: "wacRuleAbsent";
}
