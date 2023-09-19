import type { AccessRuleFetchError } from "../results/success/AccessRule";

export async function getAccessRules(): Promise<AccessRuleFetchError> {
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
