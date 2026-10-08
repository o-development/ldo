import type { SubjectNode } from "@ldo/rdf-utils";
import type { ShapeType, LdoBase, LdoBuilder } from "@ldo/ldo";
import { useTrackingProxy } from "../util/useTrackingProxy";
import type { ConnectedPlugin, IConnectedLdoDataset } from "@ldo/connected";
import { computed, toValue, type MaybeRefOrGetter, type Ref } from "vue";

export interface UseSubjectOptions<Plugins extends ConnectedPlugin[]> {
  dataset?: IConnectedLdoDataset<Plugins>;
}

export type useSubjectType<Plugins extends ConnectedPlugin[]> = {
  <Type extends LdoBase>(
    shapeType: MaybeRefOrGetter<ShapeType<Type>>,
    subject: MaybeRefOrGetter<string | SubjectNode>,
    options?: MaybeRefOrGetter<UseSubjectOptions<Plugins>>,
  ): Ref<Type>;
  <Type extends LdoBase>(
    shapeType: MaybeRefOrGetter<ShapeType<Type>>,
    subject?: MaybeRefOrGetter<string | SubjectNode | undefined>,
    options?: MaybeRefOrGetter<UseSubjectOptions<Plugins>>,
  ): Ref<Type | undefined>;
  <Type extends LdoBase>(
    shapeType: MaybeRefOrGetter<ShapeType<Type>>,
    subject?: MaybeRefOrGetter<string | SubjectNode | undefined>,
    options?: MaybeRefOrGetter<UseSubjectOptions<Plugins>>,
  ): Ref<Type | undefined>;
};

/**
 * @internal
 *
 * Creates a useSubject composable.
 */
export function createUseSubject<Plugins extends ConnectedPlugin[]>(
  dataset: IConnectedLdoDataset<Plugins>,
): useSubjectType<Plugins> {
  /**
   * Returns a reactive Linked Data Object based on the provided subject.
   * Triggers a rerender if the data are updated.
   */
  return function useSubject<Type extends LdoBase>(
    shapeType: MaybeRefOrGetter<ShapeType<Type>>,
    subject?: MaybeRefOrGetter<string | SubjectNode | undefined>,
    options?: MaybeRefOrGetter<UseSubjectOptions<Plugins>>,
  ): Ref<Type | undefined> {
    const createLdo = computed(() => {
      const subjectValue = toValue(subject);
      if (!subjectValue) return undefined;
      return (builder: LdoBuilder<Type>) => builder.fromSubject(subjectValue);
    });

    return useTrackingProxy(
      shapeType,
      createLdo,
      () => toValue(options)?.dataset ?? dataset,
    );
  };
}
