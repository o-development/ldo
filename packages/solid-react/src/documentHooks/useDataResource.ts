import { useLdoContext } from "../LdoContext";
import { UseDocumentOptions, useDocument } from "./useDocument";

export function useDataResource(uri: string, options?: UseDocumentOptions) {
  const { dataResourceStore } = useLdoContext();
  return useDocument(uri, dataResourceStore, options);
}
