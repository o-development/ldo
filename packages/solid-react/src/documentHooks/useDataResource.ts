import { useMemo } from "react";
import { useSolidLdoDataset } from "../SolidLdoProvider";
import type { UseDocumentOptions } from "./useDocument";
import { useTrackStateUpdate } from "./useDocument";

export function useDataResource(uri: string, options?: UseDocumentOptions) {
  const solidLdoDataset = useSolidLdoDataset();

  const document = useMemo(() => {
    return solidLdoDataset.getDataResource(uri);
  }, [uri, solidLdoDataset]);

  useTrackStateUpdate(document, options);

  return document;
}
