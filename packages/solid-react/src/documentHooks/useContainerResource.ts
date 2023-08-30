import { useLdoContext } from "../LdoContext";
import { UseDocumentOptions, useDocument } from "./useDocument";

export function useContainerResource(
  uri: string,
  options?: UseDocumentOptions
) {
  const { containerResourceStore } = useLdoContext();
  return useDocument(uri, containerResourceStore, options);
}
