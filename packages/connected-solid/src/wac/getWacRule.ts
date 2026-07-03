/* eslint-disable @typescript-eslint/no-explicit-any */
import { GetWacRuleSuccess } from "./results/GetWacRuleSuccess";
import { AuthorizationShapeType } from "../_ldo/wac.shapeTypes";
import type { AccessModeList, WacRule } from "./WacRule";
import type { Authorization } from "../_ldo/wac.typings";
import { WacRuleAbsent } from "./results/WacRuleAbsent";
import {
  HttpErrorResult,
  type HttpErrorResultType,
} from "../requester/results/error/HttpErrorResult";
import { NoncompliantPodError } from "../requester/results/error/NoncompliantPodError";
import type { UnexpectedResourceError } from "@ldo/connected";
import type { SolidLeaf } from "../resources/SolidLeaf";
import type { SolidContainer } from "../resources/SolidContainer";
import { guaranteeFetch } from "../util/guaranteeFetch";
import type { BasicRequestOptions } from "../requester/requests/requestOptions";
import { rawTurtleToDataset } from "../util/rdfUtils";

export type GetWacRuleError<
  ResourceType extends SolidContainer<any[]> | SolidLeaf<any[]>,
> =
  | HttpErrorResultType<ResourceType>
  | NoncompliantPodError<ResourceType>
  | UnexpectedResourceError<ResourceType>;

export type GetWacRuleResult<
  ResourceType extends SolidContainer<any[]> | SolidLeaf<any[]>,
> =
  | GetWacRuleSuccess<ResourceType>
  | GetWacRuleError<ResourceType>
  | WacRuleAbsent<ResourceType>;

type GetWacRuleOptions<
  ResourceType extends SolidContainer<any[]> | SolidLeaf<any[]>,
> = ResourceType extends SolidContainer<any[]>
  ? { inheritable?: boolean }
  : never;

/**
 * Given the URI of an ACL document, return the Web Access Control (WAC) rules
 * @param aclUri: The URI for the ACL document
 * @param options: Options object to include an authenticated fetch function
 * @returns GetWacRuleResult
 */
export async function getWacRuleWithAclUri(
  aclUri: string,
  resource: SolidContainer<any[]>,
  options?: BasicRequestOptions & GetWacRuleOptions<SolidContainer<any[]>>,
): Promise<GetWacRuleResult<SolidContainer<any[]>>>;
export async function getWacRuleWithAclUri(
  aclUri: string,
  resource: SolidLeaf<any[]>,
  options?: BasicRequestOptions & GetWacRuleOptions<SolidLeaf<any[]>>,
): Promise<GetWacRuleResult<SolidLeaf<any[]>>>;
export async function getWacRuleWithAclUri(
  aclUri: string,
  resource: SolidLeaf<any[]> | SolidContainer<any[]>,
  options?: BasicRequestOptions &
    GetWacRuleOptions<SolidLeaf<any[]> | SolidContainer<any[]>>,
): Promise<GetWacRuleResult<SolidLeaf<any[]> | SolidContainer<any[]>>>;
export async function getWacRuleWithAclUri(
  aclUri: string,
  resource: SolidLeaf<any[]> | SolidContainer<any[]>,
  options?: BasicRequestOptions &
    GetWacRuleOptions<SolidLeaf<any[]> | SolidContainer<any[]>>,
): Promise<GetWacRuleResult<SolidLeaf<any[]> | SolidContainer<any[]>>> {
  const fetch = guaranteeFetch(options?.fetch);
  const response = await fetch(aclUri);
  const errorResult = HttpErrorResult.checkResponse(resource, response);
  if (errorResult) return errorResult;

  if (response.status === 404) {
    return new WacRuleAbsent(resource);
  }

  // Parse Turtle
  const rawTurtle = await response.text();
  const rawTurtleResult = await rawTurtleToDataset(rawTurtle, aclUri);
  if (rawTurtleResult instanceof Error)
    return new NoncompliantPodError(resource, rawTurtleResult.message);
  const dataset = rawTurtleResult;
  const authorizations = dataset
    .usingType(AuthorizationShapeType)
    .matchSubject(
      "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
      "http://www.w3.org/ns/auth/acl#Authorization",
    );

  const explicitAuthorizations = authorizations.filter(
    (a) => a.accessTo?.["@id"] === resource.uri,
  );
  const inheritableAuthorizations = authorizations.filter(
    (a) => a.default?.["@id"] === resource.uri,
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

  const effectiveAuthorizations = options?.inheritable
    ? inheritableAuthorizations
    : explicitAuthorizations;

  effectiveAuthorizations.forEach((authorization) => {
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

  return new GetWacRuleSuccess(resource, wacRule);
}
