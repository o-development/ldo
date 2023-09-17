import type {
  AccessRuleFetchError,
  AccessRuleResult,
} from "../requestResults/AccessRule";
import type { SimpleRequestParams } from "./requestParams";

export async function getAccessRules(
  _params: SimpleRequestParams,
): Promise<AccessRuleResult | AccessRuleFetchError> {
  throw new Error("Not Implemented");
  // const [publicAccess, agentAccess] = await Promise.all([
  //   universalAccess.getPublicAccess(uri, { fetch }),
  //   universalAccess.getAgentAccessAll(uri, { fetch }),
  // ]);
  // if (agentAccess === null || publicAccess === null) {
  //   return new AccessRuleFetchError(uri);
  // }
  // return new AccessRuleResult(uri, publicAccess, agentAccess);
}
