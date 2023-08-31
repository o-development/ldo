import { useLdoContext } from "../LdoContext";
import type { UseDocumentOptions } from "./useDocument";
import { useDocument } from "./useDocument";

export function useDataResource(uri: string, options?: UseDocumentOptions) {
  const { dataResourceStore } = useLdoContext();
  return useDocument(uri, dataResourceStore, options);
}
