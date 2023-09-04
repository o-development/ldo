import { useMemo } from "react";
import { useSolidLdoDataset } from "../SolidLdoProvider";
import type { UseDocumentOptions } from "./useDocument";
import { useTrackStateUpdate } from "./useDocument";

export function useBinaryResource(uri: string, options?: UseDocumentOptions) {
  const solidLdoDataset = useSolidLdoDataset();

  const document = useMemo(() => {
    return solidLdoDataset.getBinaryResource(uri);
  }, [uri, solidLdoDataset]);

  useTrackStateUpdate(document, options);

  return document;
}
