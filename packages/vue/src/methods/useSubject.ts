import type { SubjectNode } from "@ldo/rdf-utils";
import type { ShapeType, LdoBase } from "@ldo/ldo";
import { useTrackingProxy } from "../util/useTrackingProxy";
import type {
  ConnectedLdoDataset,
  ConnectedPlugin,
  IConnectedLdoDataset,
} from "@ldo/connected";
import { computed, toValue, type MaybeRef, type Ref } from "vue";

export interface UseSubjectOptions<Plugins extends ConnectedPlugin[]> {
  dataset?: IConnectedLdoDataset<Plugins>;
}

export type useSubjectType<Plugins extends ConnectedPlugin[]> = {
  <Type extends LdoBase>(
    shapeType: ShapeType<Type>,
    subject: MaybeRef<string | SubjectNode>,
    options?: UseSubjectOptions<Plugins>,
  ): Type;
  <Type extends LdoBase>(
    shapeType: ShapeType<Type>,
    subject?: MaybeRef<string | SubjectNode>,
    options?: UseSubjectOptions<Plugins>,
  ): Type | undefined;
  <Type extends LdoBase>(
    shapeType: ShapeType<Type>,
    subject?: MaybeRef<string | SubjectNode>,
    options?: UseSubjectOptions<Plugins>,
  ): Type | undefined;
};

/**
 * @internal
 *
 * Creates a useSubject function.
 */
export function createUseSubject<Plugins extends ConnectedPlugin[]>(
  dataset: ConnectedLdoDataset<Plugins>,
): useSubjectType<Plugins> {
  /**
   * Returns a Linked Data Object based on the provided subject.
   * Triggers a rerender if the data are updated.
   */
  return function useSubject<Type extends LdoBase>(
    shapeType: ShapeType<Type>,
    subject?: MaybeRef<string | SubjectNode>,
    options?: UseSubjectOptions<Plugins>,
  ): Ref<Type | undefined> {
    return computed(() => {
      const subjectValue = toValue(subject);
      if (!subjectValue) return undefined;

      return useTrackingProxy(
        shapeType,
        (builder) => builder.fromSubject(subjectValue),
        options?.dataset ?? dataset,
      ).value;
    });
  };
}
