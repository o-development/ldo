import { useEffect, useMemo } from "react";
import {
  DocumentStore,
  DocumentStoreDependencies,
} from "../document/DocumentStore";
import { FetchableDocument } from "../document/FetchableDocument";
import { useForceUpdate } from "../util/useForceReload";

export interface UseDocumentOptions {
  suppressLoadOnMount: boolean;
}

export function useDocument<
  DocumentType extends FetchableDocument,
  Initializer
>(
  initializer: Initializer,
  documentStore: DocumentStore<
    DocumentType,
    Initializer,
    DocumentStoreDependencies
  >,
  options?: UseDocumentOptions
) {
  const document = useMemo(() => {
    return documentStore.get(initializer);
  }, [initializer, documentStore]);

  const forceUpdate = useForceUpdate();

  useEffect(() => {
    // Set up the listener for state update
    function onStateUpdateCallback() {
      forceUpdate();
    }
    document.onStateUpdate(onStateUpdateCallback);
    // Load the resource if load on mount is true
    if (!options?.suppressLoadOnMount) {
      document.read();
    }
    return () => document.offStateUpdate(onStateUpdateCallback);
  }, []);

  return document;
}
