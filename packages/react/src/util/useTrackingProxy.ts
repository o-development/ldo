import type { LdoBuilder } from "@ldo/ldo";
import type { LdoDataset } from "@ldo/ldo";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createTrackingDataset } from "@ldo/connected";
import type { TermWrapper, ITermWrapperConstructor } from "@rdfjs/wrapper";

/**
 * @internal
 *
 * A hook for tracking proxies
 */
export function useTrackingProxy<Type extends TermWrapper, ReturnType>(
  termWrapperClass: ITermWrapperConstructor<Type>,
  createLdo: (builder: LdoBuilder<Type>) => ReturnType,
  dataset: LdoDataset,
): ReturnType {
  const [forceUpdateCounter, setForceUpdateCounter] = useState(0);
  const forceUpdate = useCallback(
    () => setForceUpdateCounter((val) => val + 1),
    [],
  );

  // The main linked data object
  const linkedDataObject = useMemo(() => {
    // Remove all current subscriptions
    dataset.removeListenerFromAllEvents(forceUpdate);
    const builder = createTrackingDataset(dataset, forceUpdate).usingType(
      termWrapperClass,
    );

    return createLdo(builder);
  }, [termWrapperClass, dataset, forceUpdateCounter, forceUpdate, createLdo]);

  useEffect(() => {
    // Unregister force update listener upon unmount
    return () => {
      dataset.removeListenerFromAllEvents(forceUpdate);
    };
  }, [termWrapperClass]);

  return linkedDataObject;
}
