import type { QuadMatch } from "@ldo/rdf-utils";
import type { ShapeType, LdoBase, LdSet } from "@ldo/ldo";
import { useTrackingProxy } from "../util/useTrackingProxy";
import type {
  ConnectedLdoDataset,
  ConnectedPlugin,
  IConnectedLdoDataset,
} from "@ldo/connected";
import { computed, toValue, type MaybeRefOrGetter, type Ref } from "vue";

export interface UseMatchObjectOptions<Plugins extends ConnectedPlugin[]> {
  dataset?: IConnectedLdoDataset<Plugins>;
}

/**
 * @internal
 *
 * Creates a useMatchObject function.
 */
export function createUseMatchObject<Plugins extends ConnectedPlugin[]>(
  dataset: ConnectedLdoDataset<Plugins>,
) {
  /**
   * Returns a LDO set of matching items.
   * Triggers a rerender if the data are updated.
   */
  return function useMatchObject<Type extends LdoBase>(
    shapeType: ShapeType<Type>,
    subject?: MaybeRefOrGetter<QuadMatch[0] | string>,
    predicate?: MaybeRefOrGetter<QuadMatch[1] | string>,
    graph?: MaybeRefOrGetter<QuadMatch[3] | string>,
    options?: MaybeRefOrGetter<UseMatchObjectOptions<Plugins>>,
  ): Ref<LdSet<Type>> {
    return computed(() => {
      const subjectValue = toValue(subject);
      const predicateValue = toValue(predicate);
      const graphValue = toValue(graph);
      const observedOptions = toValue(options);

      return useTrackingProxy(
        shapeType,
        (builder) =>
          builder.matchObject(subjectValue, predicateValue, graphValue),
        observedOptions?.dataset ?? dataset,
      ).value;
    });
  };
}
