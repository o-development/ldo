import type { SubjectNode } from "@ldo/rdf-utils";
import type { ShapeType, LdoBase } from "@ldo/ldo";
import { useTrackingProxy } from "../util/useTrackingProxy";
import type {
  ConnectedLdoDataset,
  ConnectedPlugin,
  IConnectedLdoDataset,
} from "@ldo/connected";
import { computed, toValue, type MaybeRefOrGetter, type Ref } from "vue";

export interface UseSubjectOptions<Plugins extends ConnectedPlugin[]> {
  dataset?: IConnectedLdoDataset<Plugins>;
}

export type useSubjectType<Plugins extends ConnectedPlugin[]> = {
  <Type extends LdoBase>(
    shapeType: ShapeType<Type>,
    subject: MaybeRefOrGetter<string | SubjectNode>,
    options?: MaybeRefOrGetter<UseSubjectOptions<Plugins>>,
  ): Ref<Type>;
  <Type extends LdoBase>(
    shapeType: ShapeType<Type>,
    subject?: MaybeRefOrGetter<string | SubjectNode>,
    options?: MaybeRefOrGetter<UseSubjectOptions<Plugins>>,
  ): Ref<Type | undefined>;
  <Type extends LdoBase>(
    shapeType: ShapeType<Type>,
    subject?: MaybeRefOrGetter<string | SubjectNode>,
    options?: MaybeRefOrGetter<UseSubjectOptions<Plugins>>,
  ): Ref<Type | undefined>;
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
    subject?: MaybeRefOrGetter<string | SubjectNode>,
    options?: MaybeRefOrGetter<UseSubjectOptions<Plugins>>,
  ): Ref<Type | undefined> {
    return computed(() => {
      const subjectValue = toValue(subject);
      const observedOptions = toValue(options);
      if (!subjectValue) return undefined;

      return useTrackingProxy(
        shapeType,
        (builder) => builder.fromSubject(subjectValue),
        observedOptions?.dataset ?? dataset,
      ).value;
    });
  };
}
