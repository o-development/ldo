import { useCallback, useMemo } from "react";
import type { ConnectedLdoDataset, ConnectedPlugin } from "@ldo/connected";
import { createUseChangeDataset } from "./useChangeDataset.js";
import type { LdoBase, LdSet, ShapeType } from "@ldo/ldo";
import type { QuadMatch } from "@ldo/rdf-utils";
import type { useChangeReturn, useChangeSetData } from "./types.js";
import {
  createUseMatchSubject,
  type UseMatchSubjectOptions,
} from "../useMatchSubject.js";

/**
 * @internal
 *
 * Creates a useChangeMatchSubject function
 */
export function createUseChangeMatchSubject<Plugins extends ConnectedPlugin[]>(
  dataset: ConnectedLdoDataset<Plugins>,
) {
  const useChangeDataset = createUseChangeDataset(dataset);
  const useMatchSubject = createUseMatchSubject(dataset);

  /**
   * Returns a list of matched subjects that can be modified and committed
   */
  return function useChangeSubject<Type extends LdoBase>(
    shapeType: ShapeType<Type>,
    predicate?: QuadMatch[1] | string,
    object?: QuadMatch[2] | string,
    graph?: QuadMatch[3] | string,
    options?: UseMatchSubjectOptions<Plugins>,
  ): useChangeReturn<LdSet<Type>, Plugins> {
    const [transactionDataset, setDataset, commitData] = useChangeDataset(
      options?.dataset,
    );

    const ldSubjects = useMatchSubject(shapeType, predicate, object, graph, {
      dataset: transactionDataset,
    });

    const setData = useCallback<useChangeSetData<LdSet<Type>, Plugins>>(
      (writeResource, changer, _other) => {
        setDataset((dataset) => {
          const ldSet = dataset
            .usingType(shapeType)
            .write(writeResource.uri)
            .matchSubject(predicate, object, graph);
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          changer(ldSet);
        });
      },
      [setDataset, object, predicate, graph, shapeType],
    );

    return useMemo(
      () => [ldSubjects, setData, commitData],
      [ldSubjects, setData, commitData],
    );
  };
}
