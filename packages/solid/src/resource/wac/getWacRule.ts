import type { GetWacRuleSuccess } from "./results/GetWacRuleSuccess";
import { guaranteeFetch } from "../../util/guaranteeFetch";
import type { BasicRequestOptions } from "../../requester/requests/requestOptions";
import type { HttpErrorResultType } from "../../requester/results/error/HttpErrorResult";
import { HttpErrorResult } from "../../requester/results/error/HttpErrorResult";
import type { NoncompliantPodError } from "../../requester/results/error/NoncompliantPodError";
import type { UnexpectedResourceError } from "../../requester/results/error/ErrorResult";
import { rawTurtleToDataset } from "../../util/rdfUtils";
import { AuthorizationShapeType } from "../../.ldo/wac.shapeTypes";
import type { AccessModeList, WacRule } from "./WacRule";
import type { Authorization } from "../../.ldo/wac.typings";

export type GetWacRuleError =
  | HttpErrorResultType
  | NoncompliantPodError
  | UnexpectedResourceError;
export type GetWacRuleResult = GetWacRuleSuccess | GetWacRuleError;

export async function getWacRuleWithAclUri(
  aclUri: string,
  options?: BasicRequestOptions,
): Promise<GetWacRuleResult> {
  const fetch = guaranteeFetch(options?.fetch);
  const response = await fetch(aclUri);
  const errorResult = HttpErrorResult.checkResponse(aclUri, response);
  if (errorResult) return errorResult;

  // Parse Turtle
  const rawTurtle = await response.text();
  const rawTurtleResult = await rawTurtleToDataset(rawTurtle, aclUri);
  if (rawTurtleResult.isError) return rawTurtleResult;
  const dataset = rawTurtleResult.dataset;
  const authorizations = dataset
    .usingType(AuthorizationShapeType)
    .matchSubject(
      "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
      "http://www.w3.org/ns/auth/acl#Authorization",
    );

  const wacRule: WacRule = {
    public: {
      read: false,
      write: false,
      append: false,
      control: false,
    },
    authenticated: {
      read: false,
      write: false,
      append: false,
      control: false,
    },
    agent: {},
  };

  function applyAccessModesToList(
    accessModeList: AccessModeList,
    authorization: Authorization,
  ): void {
    authorization.mode?.forEach((mode) => {
      accessModeList[mode["@id"].toLowerCase()] = true;
    });
  }

  authorizations.forEach((authorization) => {
    if (
      authorization.agentClass?.some(
        (agentClass) => agentClass["@id"] === "Agent",
      )
    ) {
      applyAccessModesToList(wacRule.public, authorization);
      applyAccessModesToList(wacRule.authenticated, authorization);
    }
    if (
      authorization.agentClass?.some(
        (agentClass) => agentClass["@id"] === "AuthenticatedAgent",
      )
    ) {
      applyAccessModesToList(wacRule.authenticated, authorization);
    }
    authorization.agent?.forEach((agent) => {
      if (!wacRule.agent[agent["@id"]]) {
        wacRule.agent[agent["@id"]] = {
          read: false,
          write: false,
          append: false,
          control: false,
        };
      }
      applyAccessModesToList(wacRule.agent[agent["@id"]], authorization);
    });
  });

  return {
    type: "getWacRuleSuccess",
    uri: aclUri,
    isError: false,
    wacRule,
  };
}
