import type { QuadMatch, SubjectNode } from "@ldo/rdf-utils";
import type { ShapeType, LdoBase, LdSet } from "@ldo/ldo";
import { useTrackingProxy } from "../util/useTrackingProxy";
import type {
  ConnectedLdoDataset,
  ConnectedPlugin,
  IConnectedLdoDataset,
} from "@ldo/connected";
import { computed, toValue, type MaybeRefOrGetter, type Ref } from "vue";

export interface UseMatchSubjectOptions<Plugins extends ConnectedPlugin[]> {
  dataset?: IConnectedLdoDataset<Plugins>;
}

/**
 * @internal
 *
 * Creates a useMatchSubject function.
 */
export function createUseMatchSubject<Plugins extends ConnectedPlugin[]>(
  dataset: ConnectedLdoDataset<Plugins>,
) {
  /**
   * Returns a LDO set of matching items.
   * Triggers a rerender if the data are updated.
   */
  return function useMatchSubject<Type extends LdoBase>(
    shapeType: ShapeType<Type>,
    predicate?: MaybeRefOrGetter<QuadMatch[1] | string>,
    object?: MaybeRefOrGetter<QuadMatch[2] | string>,
    graph?: MaybeRefOrGetter<QuadMatch[3] | string>,
    options?: MaybeRefOrGetter<UseMatchSubjectOptions<Plugins>>,
  ): Ref<LdSet<Type>> {
    return computed(() => {
      const predicateValue = toValue(predicate);
      const objectValue = toValue(object);
      const graphValue = toValue(graph);
      const observedOptions = toValue(options);
      console.log(predicateValue, objectValue, graphValue);

      return useTrackingProxy(
        shapeType,
        (builder) =>
          builder.matchSubject(predicateValue, objectValue, graphValue),
        observedOptions?.dataset ?? dataset,
      ).value;
    });
  };
}
