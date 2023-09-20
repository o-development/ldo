import type { Access } from "@inrupt/solid-client";
import type { ResourceSuccess } from "./SuccessResult";

export interface AccessRule {
  public?: Access;
  agent?: Record<string, Access>;
}

export interface SetAccessRuleSuccess extends ResourceSuccess {
  type: "setAccessRuleSuccess";
}
