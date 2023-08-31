import { useLdoContext } from "../LdoContext";
import type { UseDocumentOptions } from "./useDocument";
import { useDocument } from "./useDocument";

export function useBinaryResource(uri: string, options?: UseDocumentOptions) {
  const { binaryResourceStore } = useLdoContext();
  return useDocument(uri, binaryResourceStore, options);
}
