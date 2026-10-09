import type { QuadMatch } from "@ldo/rdf-utils";
import type { ShapeType, LdoBase, LdSet, LdoBuilder } from "@ldo/ldo";
import { useTrackingProxy } from "../util/useTrackingProxy";
import type { ConnectedPlugin, IConnectedLdoDataset } from "@ldo/connected";
import { computed, toValue, type MaybeRefOrGetter, type Ref } from "vue";

export interface UseMatchSubjectOptions<Plugins extends ConnectedPlugin[]> {
  dataset?: IConnectedLdoDataset<Plugins>;
}

/**
 * @internal
 *
 * Creates a useMatchSubject composable.
 */
export function createUseMatchSubject<Plugins extends ConnectedPlugin[]>(
  dataset: IConnectedLdoDataset<Plugins>,
) {
  /**
   * Returns a reactive LDO set of matching linked data objects.
   * Triggers a rerender if the data are updated.
   */
  return function useMatchSubject<Type extends LdoBase>(
    shapeType: MaybeRefOrGetter<ShapeType<Type>>,
    predicate?: MaybeRefOrGetter<QuadMatch[1] | string>,
    object?: MaybeRefOrGetter<QuadMatch[2] | string>,
    graph?: MaybeRefOrGetter<QuadMatch[3] | string>,
    options?: MaybeRefOrGetter<UseMatchSubjectOptions<Plugins>>,
  ): Ref<LdSet<Type>> {
    const createLdo = computed(() => {
      const predicateValue = toValue(predicate);
      const objectValue = toValue(object);
      const graphValue = toValue(graph);
      return (builder: LdoBuilder<Type>) =>
        builder.matchSubject(predicateValue, objectValue, graphValue);
    });

    return useTrackingProxy(
      shapeType,
      createLdo,
      () => toValue(options)?.dataset ?? dataset,
    );
  };
}
