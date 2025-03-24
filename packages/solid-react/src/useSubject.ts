import type { SubjectNode } from "@ldo/rdf-utils";
import type { ShapeType } from "@ldo/ldo";
import type { LdoBuilder } from "@ldo/ldo";
import type { LdoBase } from "@ldo/ldo";
import { useCallback } from "react";

import { useTrackingProxy } from "./util/useTrackingProxy";

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
  const fromSubject = useCallback(
    (builder: LdoBuilder<Type>) => {
      if (!subject) return;
      return builder.fromSubject(subject);
    },
    [subject],
  );

  return useTrackingProxy(shapeType, fromSubject);
}
