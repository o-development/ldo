import type { Access } from "@inrupt/solid-client";
import { ErrorResult } from "./ErrorResult";
import { RequesterResult } from "./RequesterResult";

export interface AccessRule {
  public?: Access;
  agent?: Record<string, Access>;
}

export class AccessRuleChangeResult
  extends RequesterResult
  implements AccessRule
{
  type = "accessRuleChange" as const;
  readonly public?: Access;
  readonly agent?: Record<string, Access>;

  constructor(
    uri: string,
    publicRules?: Access,
    agentRules?: Record<string, Access>,
  ) {
    super(uri);
    this.public = publicRules;
    this.agent = agentRules;
  }
}

export class AccessRuleResult extends RequesterResult implements AccessRule {
  type = "accessRule" as const;
  readonly public: Access;
  readonly agent: Record<string, Access>;

  constructor(
    uri: string,
    publicRules: Access,
    agentRules: Record<string, Access>,
  ) {
    super(uri);
    this.public = publicRules;
    this.agent = agentRules;
  }
}

export class AccessRuleFetchError extends ErrorResult {
  readonly errorType = "accessRuleFetch" as const;

  constructor(uri: string, message?: string) {
    super(uri, message || `Cannot get access rules for ${uri}.`);
  }
}
