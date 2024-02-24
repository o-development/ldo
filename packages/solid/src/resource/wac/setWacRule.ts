import { createLdoDataset } from "@ldo/ldo";
import type { BasicRequestOptions } from "../../requester/requests/requestOptions";
import type { UnexpectedResourceError } from "../../requester/results/error/ErrorResult";
import {
  HttpErrorResult,
  type HttpErrorResultType,
} from "../../requester/results/error/HttpErrorResult";
import { isContainerUri, type LeafUri } from "../../util/uriTypes";
import type { AccessModeList, WacRule } from "./WacRule";
import type { SetWacRuleSuccess } from "./results/SetWacRuleSuccess";
import type { Authorization } from "../../.ldo/wac.typings";
import { AuthorizationShapeType } from "../../.ldo/wac.shapeTypes";
import { v4 } from "uuid";
import { guaranteeFetch } from "../../util/guaranteeFetch";

export type SetWacRuleError = HttpErrorResultType | UnexpectedResourceError;
export type SetWacRuleResult = SetWacRuleSuccess | SetWacRuleError;

/**
 * Given the URI of an ACL document and some WAC rules, set the WAC rules of
 * that document
 * @param aclUri: The URI for the ACL document
 * @param newRule: A new WAC rule to set. This will overwrite old rules
 * @param accessTo: The document this rule refers to
 * @param options: Options object to include an authenticated fetch function
 * @returns SetWacRuleResult
 */
export async function setWacRuleForAclUri(
  aclUri: LeafUri,
  newRule: WacRule,
  accessTo: string,
  options?: BasicRequestOptions,
): Promise<SetWacRuleResult> {
  const fetch = guaranteeFetch(options?.fetch);
  // The rule map keeps track of all the rules that are currently being used
  // so that similar rules can be grouped together
  const ruleMap: Record<string, Authorization> = {};
  // The dataset that will eventually be sent to the Pod
  const dataset = createLdoDataset();

  // Helper function to add rules to the dataset by grouping them in the ruleMap
  function addRuleToDataset(
    type: "public" | "authenticated" | "agent",
    accessModeList: AccessModeList,
    agentId?: string,
  ) {
    const accessModeListHash = hashAccessModeList(accessModeList);
    // No need to add if all access is false
    if (accessModeListHash === "") return;
    if (!ruleMap[accessModeListHash]) {
      const authorization = dataset
        .usingType(AuthorizationShapeType)
        .fromSubject(`${aclUri}#${v4()}`);
      authorization.type = { "@id": "Authorization" };
      if (accessModeList.read) authorization.mode?.push({ "@id": "Read" });
      if (accessModeList.write) authorization.mode?.push({ "@id": "Write" });
      if (accessModeList.append) authorization.mode?.push({ "@id": "Append" });
      if (accessModeList.control)
        authorization.mode?.push({ "@id": "Control" });
      authorization.accessTo = { "@id": accessTo };
      if (isContainerUri(accessTo)) {
        authorization.default = { "@id": accessTo };
      }
      ruleMap[accessModeListHash] = authorization;
    }
    const authorization = ruleMap[accessModeListHash];
    // Add agents to the rule
    if (type === "public") {
      authorization.agentClass?.push({ "@id": "Agent" });
    } else if (type === "authenticated") {
      authorization.agentClass?.push({ "@id": "AuthenticatedAgent" });
    } else if (type === "agent" && agentId) {
      authorization.agent?.push({ "@id": agentId });
    }
  }

  // Add each rule to the dataset
  addRuleToDataset("public", newRule.public);
  addRuleToDataset("authenticated", newRule.authenticated);
  Object.entries(newRule.agent).forEach(([agentUri, accessModeList]) => {
    addRuleToDataset("agent", accessModeList, agentUri);
  });

  // Save to Pod
  const response = await fetch(aclUri, {
    method: "PUT",
    headers: {
      "content-type": "text/turtle",
    },
    body: dataset.toString(),
  });
  const errorResult = HttpErrorResult.checkResponse(aclUri, response);
  if (errorResult) return errorResult;

  return {
    type: "setWacRuleSuccess",
    uri: aclUri,
    isError: false,
    wacRule: newRule,
  };
}

// Hashes the access mode list for use in the rule map
function hashAccessModeList(list: AccessModeList): string {
  return Object.entries(list).reduce(
    (agg, [key, isPresent]) => (isPresent ? agg + key : agg),
    "",
  );
}
