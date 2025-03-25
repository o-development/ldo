import type { SubjectNode } from "@ldo/rdf-utils";
import type { ShapeType } from "@ldo/ldo";
import type { LdoBuilder } from "@ldo/ldo";
import type { LdoBase } from "@ldo/ldo";
import { useCallback } from "react";

import { useTrackingProxy } from "../util/useTrackingProxy";
import type { ConnectedLdoDataset, ConnectedPlugin } from "@ldo/connected";

export type useSubjectType = {
  <Type extends LdoBase>(
    shapeType: ShapeType<Type>,
    subject: string | SubjectNode,
  ): Type;
  <Type extends LdoBase>(
    shapeType: ShapeType<Type>,
    subject?: string | SubjectNode,
  ): Type | undefined;
  <Type extends LdoBase>(
    shapeType: ShapeType<Type>,
    subject?: string | SubjectNode,
  ): Type | undefined;
};

export function createUseSubject<Plugins extends ConnectedPlugin[]>(
  dataset: ConnectedLdoDataset<Plugins>,
): useSubjectType {
  return function useSubject<Type extends LdoBase>(
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

    return useTrackingProxy(shapeType, fromSubject, dataset);
  };
}
