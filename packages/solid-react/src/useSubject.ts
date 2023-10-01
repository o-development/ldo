import type { SubjectNode } from "@ldo/rdf-utils";
import {
  ContextUtil,
  JsonldDatasetProxyBuilder,
} from "@ldo/jsonld-dataset-proxy";
import type { ShapeType } from "@ldo/ldo";
import { LdoBuilder } from "@ldo/ldo";
import type { LdoBase } from "@ldo/ldo";
import { useLdo } from "./SolidLdoProvider";
import { useCallback, useEffect, useMemo, useState } from "react";
import { TrackingProxyContext } from "./util/TrackingProxyContext";
import { defaultGraph } from "@rdfjs/data-model";

export function useSubject<Type extends LdoBase>(
  shapeType: ShapeType<Type>,
  subject: string | SubjectNode,
): Type;
export function useSubject<Type extends LdoBase>(
  shapeType: ShapeType<Type>,
  subject?: string | SubjectNode,
): Type | undefined;
export function useSubject<Type extends LdoBase>(
  shapeType: ShapeType<Type>,
  subject?: string | SubjectNode,
): Type | undefined {
  const { dataset } = useLdo();

  const [forceUpdateCounter, setForceUpdateCounter] = useState(0);
  const forceUpdate = useCallback(
    () => setForceUpdateCounter((val) => val + 1),
    [],
  );

  // The main linked data object
  const linkedDataObject = useMemo(() => {
    if (!subject) return;

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
