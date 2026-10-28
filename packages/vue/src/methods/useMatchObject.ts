import type { QuadMatch } from "@ldo/rdf-utils";
import type { ShapeType, LdoBase, LdSet, LdoBuilder } from "@ldo/ldo";
import { useTrackingProxy } from "../util/useTrackingProxy";
import type { ConnectedPlugin, IConnectedLdoDataset } from "@ldo/connected";
import { computed, toValue, type MaybeRefOrGetter, type Ref } from "vue";

export interface UseMatchObjectOptions<Plugin extends ConnectedPlugin> {
  dataset?: IConnectedLdoDataset<Plugin[]>;
}

export interface UseMatchObjectComposable<Plugin extends ConnectedPlugin> {
  <Type extends LdoBase, CustomPlugin extends ConnectedPlugin = Plugin>(
    shapeType: MaybeRefOrGetter<ShapeType<Type>>,
    subject?: MaybeRefOrGetter<QuadMatch[0] | string>,
    predicate?: MaybeRefOrGetter<QuadMatch[1] | string>,
    graph?: MaybeRefOrGetter<QuadMatch[3] | string>,
    options?: MaybeRefOrGetter<UseMatchObjectOptions<CustomPlugin>>,
  ): Ref<LdSet<Type>>;
}

/**
 * @internal
 *
 * Creates a useMatchObject composable.
 */
export function createUseMatchObject<Plugin extends ConnectedPlugin>(
  dataset: IConnectedLdoDataset<Plugin[]>,
): UseMatchObjectComposable<Plugin> {
  /**
   * Returns a reactive LDO set of matching items.
   * Triggers a rerender if that data are updated.
   */
  return function useMatchObject<
    Type extends LdoBase,
    CustomPlugin extends ConnectedPlugin = Plugin,
  >(
    shapeType: MaybeRefOrGetter<ShapeType<Type>>,
    subject?: MaybeRefOrGetter<QuadMatch[0] | string>,
    predicate?: MaybeRefOrGetter<QuadMatch[1] | string>,
    graph?: MaybeRefOrGetter<QuadMatch[3] | string>,
    options?: MaybeRefOrGetter<UseMatchObjectOptions<CustomPlugin>>,
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
