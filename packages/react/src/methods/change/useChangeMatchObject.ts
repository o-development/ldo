import { useCallback, useMemo } from "react";
import type { ConnectedLdoDataset, ConnectedPlugin } from "@ldo/connected";
import { createUseChangeDataset } from "./useChangeDataset.js";
import type { LdoBase, LdSet, ShapeType } from "@ldo/ldo";
import type { QuadMatch } from "@ldo/rdf-utils";
import type { UseMatchObjectOptions } from "../useMatchObject.js";
import { createUseMatchObject } from "../useMatchObject.js";
import type { useChangeReturn, useChangeSetData } from "./types.js";

/**
 * @internal
 *
 * Creates a useChangeMatchObject function
 */
export function createUseChangeMatchObject<Plugins extends ConnectedPlugin[]>(
  dataset: ConnectedLdoDataset<Plugins>,
) {
  const useChangeDataset = createUseChangeDataset(dataset);
  const useMatchObject = createUseMatchObject(dataset);

  /**
   * Returns a list of matched objects that can be modified and committed
   */
  return function useChangeSubject<Type extends LdoBase>(
    shapeType: ShapeType<Type>,
    writeResource: Plugins[number]["types"]["resource"],
    subject?: QuadMatch[0] | string,
    predicate?: QuadMatch[1] | string,
    graph?: QuadMatch[3] | string,
    options?: UseMatchObjectOptions<Plugins>,
  ): useChangeReturn<LdSet<Type>, Plugins> {
    const [transactionDataset, setDataset, commitData] = useChangeDataset(
      options?.dataset,
    );

    const ldObjects = useMatchObject(shapeType, subject, predicate, graph, {
      dataset: transactionDataset,
    });

    const setData = useCallback<useChangeSetData<LdSet<Type>>>(
      (changer) => {
        setDataset((dataset) => {
          const ldSet = dataset
            .usingType(shapeType)
            .write(writeResource.uri)
            .matchObject(subject, predicate, graph);
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          changer(ldSet);
        });
      },
      [setDataset, subject, predicate, graph, shapeType, writeResource],
    );

    return useMemo(
      () => [ldObjects, setData, commitData],
      [ldObjects, setData, commitData],
    );
  };
}
