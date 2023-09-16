import type { AclDataset, WithChangeLog } from "@inrupt/solid-client";
import { getAgentAccessAll } from "@inrupt/solid-client";
import { getPublicAccess } from "@inrupt/solid-client";
import {
  getSolidDatasetWithAcl,
  hasResourceAcl,
  hasFallbackAcl,
  hasAccessibleAcl,
  createAclFromFallbackAcl,
  getResourceAcl,
  setAgentResourceAccess,
  saveAclFor,
  setPublicDefaultAccess,
  setPublicResourceAccess,
  setAgentDefaultAccess,
} from "@inrupt/solid-client";
import { isContainerUri } from "../../util/uriTypes";
import type { AccessRule } from "../requestResults/AccessRule";
import { AccessRuleChangeResult } from "../requestResults/AccessRule";
import { AccessRuleFetchError } from "../requestResults/AccessRule";
import type { SimpleRequestParams } from "./requestParams";

export async function setAccessRules(
  { uri, fetch }: SimpleRequestParams,
  newAccessRules: AccessRule,
): Promise<AccessRuleChangeResult | AccessRuleFetchError> {
  console.warn("Access Control is stil underdeveloped. Use with caution.");
  const isContainer = isContainerUri(uri);

  // Code Copied from https://docs.inrupt.com/developer-tools/javascript/client-libraries/tutorial/manage-wac/
  // Fetch the SolidDataset and its associated ACLs, if available:
  const myDatasetWithAcl = await getSolidDatasetWithAcl(uri, { fetch });

  // Obtain the SolidDataset's own ACL, if available,
  // or initialise a new one, if possible:
  let resourceAcl;
  if (!hasResourceAcl(myDatasetWithAcl)) {
    if (!hasAccessibleAcl(myDatasetWithAcl)) {
      return new AccessRuleFetchError(
        uri,
        "The current user does not have permission to change access rights to this Resource.",
      );
    }
    if (!hasFallbackAcl(myDatasetWithAcl)) {
      return new AccessRuleFetchError(
        "The current user does not have permission to see who currently has access to this Resource.",
      );
    }
    resourceAcl = createAclFromFallbackAcl(myDatasetWithAcl);
  } else {
    resourceAcl = getResourceAcl(myDatasetWithAcl);
  }

  // Give someone Control access to the given Resource:

  let updatedAcl: AclDataset & WithChangeLog = resourceAcl;
  if (newAccessRules.public) {
    if (isContainer) {
      updatedAcl = setPublicDefaultAccess(updatedAcl, newAccessRules.public);
    } else {
      updatedAcl = setPublicResourceAccess(updatedAcl, newAccessRules.public);
    }
  }
  if (newAccessRules.agent) {
    const setAgentAccess = isContainer
      ? setAgentDefaultAccess
      : setAgentResourceAccess;
    Object.entries(newAccessRules.agent).forEach(([webId, rules]) => {
      updatedAcl = setAgentAccess(updatedAcl, webId, rules);
    });
  }

  // Now save the ACL:
  await saveAclFor(myDatasetWithAcl, updatedAcl, { fetch });
  return new AccessRuleChangeResult(
    uri,
    getPublicAccess(myDatasetWithAcl) || undefined,
    getAgentAccessAll(myDatasetWithAcl) || undefined,
  );
}
