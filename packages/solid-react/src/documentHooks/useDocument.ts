import { useEffect } from "react";
import type { FetchableDocument } from "@ldo/solid";
import { useForceUpdate } from "../util/useForceReload";

export interface UseDocumentOptions {
  suppressLoadOnMount: boolean;
}

export function useTrackStateUpdate(
  document: FetchableDocument,
  options?: UseDocumentOptions,
) {
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
}
