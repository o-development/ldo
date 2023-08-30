import { useMemo } from "react";
import { useLdoContext } from "../LdoContext";
import { UseDocumentOptions, useDocument } from "./useDocument";
import { Resource } from "../document/resource/Resource";

export function useAccessRules(
  resource: string | Resource,
  options?: UseDocumentOptions
) {
  const { dataResourceStore, accessRulesStore } = useLdoContext();
  const realResource = useMemo(() => {
    return typeof resource === "string"
      ? dataResourceStore.get(resource)
      : resource;
  }, [resource]);
  return useDocument(realResource, accessRulesStore, options);
}
