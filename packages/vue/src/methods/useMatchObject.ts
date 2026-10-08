import type { QuadMatch } from "@ldo/rdf-utils";
import type { ShapeType, LdoBase, LdSet, LdoBuilder } from "@ldo/ldo";
import { useTrackingProxy } from "../util/useTrackingProxy";
import type { ConnectedPlugin, IConnectedLdoDataset } from "@ldo/connected";
import { computed, toValue, type MaybeRefOrGetter, type Ref } from "vue";

export interface UseMatchObjectOptions<Plugins extends ConnectedPlugin[]> {
  dataset?: IConnectedLdoDataset<Plugins>;
}

/**
 * @internal
 *
 * Creates a useMatchObject composable.
 */
export function createUseMatchObject<Plugins extends ConnectedPlugin[]>(
  dataset: IConnectedLdoDataset<Plugins>,
) {
  /**
   * Returns a reactive LDO set of matching items.
   * Triggers a rerender if that data are updated.
   */
  return function useMatchObject<Type extends LdoBase>(
    shapeType: MaybeRefOrGetter<ShapeType<Type>>,
    subject?: MaybeRefOrGetter<QuadMatch[0] | string>,
    predicate?: MaybeRefOrGetter<QuadMatch[1] | string>,
    graph?: MaybeRefOrGetter<QuadMatch[3] | string>,
    options?: MaybeRefOrGetter<UseMatchObjectOptions<Plugins>>,
  ): Ref<LdSet<Type>> {
    const createLdo = computed(() => {
      const subjectValue = toValue(subject);
      const predicateValue = toValue(predicate);
      const graphValue = toValue(graph);

      return (builder: LdoBuilder<Type>) =>
        builder.matchObject(subjectValue, predicateValue, graphValue);
    });

    return useTrackingProxy(
      shapeType,
      createLdo,
      () => toValue(options)?.dataset ?? dataset,
    );
  };
}
