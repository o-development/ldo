import { useMemo } from "react";
import type { UseDocumentOptions } from "./useDocument";
import { useTrackStateUpdate } from "./useDocument";
import type { Resource } from "@ldo/solid";
import { useSolidLdoDataset } from "../SolidLdoProvider";

export function useAccessRules(
  resource: string | Resource,
  options?: UseDocumentOptions,
) {
  const solidLdoDataset = useSolidLdoDataset();

  const document = useMemo(() => {
    return solidLdoDataset.getAccessRules(resource);
  }, [resource, solidLdoDataset]);

  useTrackStateUpdate(document, options);

  return document;
}
