import type { SubjectNode } from "@ldobjects/rdf-utils";
import {
  ContextUtil,
  JsonldDatasetProxyBuilder,
} from "@ldobjects/jsonld-dataset-proxy";
import type { ShapeType } from "@ldobjects/ldo";
import { LdoBuilder } from "@ldobjects/ldo";
import type { LdoBase } from "@ldobjects/ldo";
import { useLdo } from "./SolidLdoProvider";
import { useCallback, useEffect, useMemo, useState } from "react";
import { TrackingProxyContext } from "./util/TrackingProxyContext";
import { defaultGraph } from "@rdfjs/data-model";

export function useSubject<Type extends LdoBase>(
  shapeType: ShapeType<Type>,
  subject: string | SubjectNode,
): Type {
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
    return builder.fromSubject(subject);
  }, [shapeType, subject, dataset, forceUpdateCounter, forceUpdate]);

  useEffect(() => {
    // Unregister force update listener upon unmount
    return () => {
      dataset.removeListenerFromAllEvents(forceUpdate);
    };
  }, [shapeType, subject]);

  return linkedDataObject;
}
