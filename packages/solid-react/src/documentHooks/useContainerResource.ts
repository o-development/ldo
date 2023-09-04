import { useMemo } from "react";
import type { UseDocumentOptions } from "./useDocument";
import { useTrackStateUpdate } from "./useDocument";
import { useSolidLdoDataset } from "../SolidLdoProvider";

export function useContainerResource(
  uri: string,
  options?: UseDocumentOptions,
) {
  const solidLdoDataset = useSolidLdoDataset();

  const document = useMemo(() => {
    return solidLdoDataset.getContainerResource(uri);
  }, [uri, solidLdoDataset]);

  useTrackStateUpdate(document, options);

  return document;
}
