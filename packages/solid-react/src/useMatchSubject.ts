import type { LdoBase, ShapeType } from "@ldo/ldo";
import type { QuadMatch } from "@ldo/rdf-utils";
import type { LdoBuilder } from "@ldo/ldo";
import { useCallback } from "react";
import { useTrackingProxy } from "./util/useTrackingProxy";

export function useMatchSubject<Type extends LdoBase>(
  shapeType: ShapeType<Type>,
  predicate?: QuadMatch[1] | string,
  object?: QuadMatch[2] | string,
  graph?: QuadMatch[3] | string,
): Type[] {
  const matchSubject = useCallback(
    (builder: LdoBuilder<Type>) => {
      return builder.matchSubject(predicate, object, graph);
    },
    [predicate, object, graph],
  );

  return useTrackingProxy(shapeType, matchSubject);
}
