import type { LdoBase, ShapeType } from "@ldo/ldo";
import type { QuadMatch } from "@ldo/rdf-utils";
import type { LdoBuilder } from "@ldo/ldo";
import { useCallback } from "react";
import { useTrackingProxy } from "./util/useTrackingProxy";

export function useMatchObject<Type extends LdoBase>(
  shapeType: ShapeType<Type>,
  subject?: QuadMatch[0] | string,
  predicate?: QuadMatch[1] | string,
  graph?: QuadMatch[3] | string,
): Type[] {
  const matchObject = useCallback(
    (builder: LdoBuilder<Type>) => {
      return builder.matchObject(subject, predicate, graph);
    },
    [subject, predicate, graph],
  );

  return useTrackingProxy(shapeType, matchObject);
}
