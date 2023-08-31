import { useLdoContext } from "../LdoContext";
import type { UseDocumentOptions } from "./useDocument";
import { useDocument } from "./useDocument";

export function useContainerResource(
  uri: string,
  options?: UseDocumentOptions,
) {
  const { containerResourceStore } = useLdoContext();
  return useDocument(uri, containerResourceStore, options);
}
