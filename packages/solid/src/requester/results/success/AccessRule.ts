import type { Access } from "@inrupt/solid-client";
import { ResourceError } from "../error/ErrorResult";
import { ResourceSuccess } from "./SuccessResult";

export interface AccessRule {
  public?: Access;
  agent?: Record<string, Access>;
}

export class SetAccessRuleSuccess extends ResourceSuccess {
  type = "setAccessRuleSuccess" as const;
}

export class AccessRuleFetchError extends ResourceError {
  readonly type = "accessRuleFetchError" as const;

  constructor(uri: string, message?: string) {
    super(uri, message || `Cannot get access rules for ${uri}.`);
  }
}
