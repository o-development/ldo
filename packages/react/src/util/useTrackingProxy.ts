import {
  ContextUtil,
  JsonldDatasetProxyBuilder,
} from "@ldo/jsonld-dataset-proxy";
import { LdoBuilder } from "@ldo/ldo";
import type { LdoBase, ShapeType } from "@ldo/ldo";
import { useCallback, useEffect, useMemo, useState } from "react";
import { TrackingProxyContext } from "./TrackingProxyContext";
import { defaultGraph } from "@rdfjs/data-model";
import { useLdo } from "../SolidLdoProvider";

export function useTrackingProxy<Type extends LdoBase, ReturnType>(
  shapeType: ShapeType<Type>,
  createLdo: (builder: LdoBuilder<Type>) => ReturnType,
): ReturnType {
  const { dataset } = useLdo();

  const [forceUpdateCounter, setForceUpdateCounter] = useState(0);
  const forceUpdate = useCallback(
    () => setForceUpdateCounter((val) => val + 1),
    [],
  );

  // The main linked data object
  const linkedDataObject = useMemo(() => {
    // Remove all current subscriptions
    dataset.removeListenerFromAllEvents(forceUpdate);

    // Rebuild the LdoBuilder from scratch to inject TrackingProxyContext
    const contextUtil = new ContextUtil(shapeType.context);
    const proxyContext = new TrackingProxyContext(
      {
        dataset,
        contextUtil,
        writeGraphs: [defaultGraph()],
        languageOrdering: ["none", "en", "other"],
      },
      forceUpdate,
    );
    const builder = new LdoBuilder(
      new JsonldDatasetProxyBuilder(proxyContext),
      shapeType,
    );
    return createLdo(builder);
  }, [shapeType, dataset, forceUpdateCounter, forceUpdate, createLdo]);

  useEffect(() => {
    // Unregister force update listener upon unmount
    return () => {
      dataset.removeListenerFromAllEvents(forceUpdate);
    };
  }, [shapeType]);

  return linkedDataObject;
}
