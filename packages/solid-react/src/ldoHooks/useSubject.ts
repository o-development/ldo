import {
  ContextUtil,
  JsonldDatasetProxyBuilder,
  SubjectType,
} from "jsonld-dataset-proxy";
import { LdoBuilder, ShapeType } from "ldo";
import { LdoBase } from "ldo/dist/util";
import { useLdoContext } from "../LdoContext";
import { useCallback, useEffect, useMemo, useState } from "react";
import { TrackingProxyContext } from "./helpers/TrackingProxyContext";
import { defaultGraph } from "@rdfjs/data-model";

export function useSubject<Type extends LdoBase>(
  shapeType: ShapeType<Type>,
  subject: string | SubjectType
): [Type, undefined] | [undefined, Error] {
  const { dataset, updateManager } = useLdoContext();

  const [forceUpdateCounter, setForceUpdateCounter] = useState(0);
  const forceUpdate = useCallback(
    () => setForceUpdateCounter((val) => val + 1),
    [setForceUpdateCounter]
  );

  // The main linked data object
  const linkedDataObject = useMemo(() => {
    // Rebuild the LdoBuilder from scratch to inject TrackingProxyContext
    const contextUtil = new ContextUtil(shapeType.context);
    const proxyContext = new TrackingProxyContext(
      {
        dataset,
        contextUtil,
        writeGraphs: [defaultGraph()],
        languageOrdering: ["none", "en", "other"],
      },
      updateManager,
      forceUpdate
    );
    const builder = new LdoBuilder(
      new JsonldDatasetProxyBuilder(proxyContext),
      shapeType
    );
    return builder.fromSubject(subject);
  }, [
    shapeType,
    subject,
    dataset,
    updateManager,
    forceUpdateCounter,
    forceUpdate,
  ]);

  useEffect(() => {
    // Unregister force update listener upon unmount
    return () => updateManager.removeListener(forceUpdate);
  }, [shapeType, subject]);

  return [linkedDataObject, undefined];
}
