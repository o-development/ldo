import type { LdoBuilder } from "@ldo/ldo";
import type { LdoBase, LdoDataset, ShapeType } from "@ldo/ldo";
import { createTrackingProxyBuilder } from "@ldo/connected";
import {
  type MaybeRefOrGetter,
  type Ref,
  shallowRef,
  toValue,
  triggerRef,
  watch,
} from "vue";

/**
 * @internal
 *
 * A composable for tracking proxies.
 */
export function useTrackingProxy<Type extends LdoBase, ReturnType>(
  shapeType: MaybeRefOrGetter<ShapeType<Type>>,
  createLdo: MaybeRefOrGetter<(builder: LdoBuilder<Type>) => ReturnType>,
  dataset: MaybeRefOrGetter<LdoDataset>,
): Ref<ReturnType>;
export function useTrackingProxy<Type extends LdoBase, _ReturnType>(
  shapeType: MaybeRefOrGetter<ShapeType<Type>>,
  createLdo: MaybeRefOrGetter<undefined>,
  dataset: MaybeRefOrGetter<LdoDataset>,
): Ref<undefined>;
export function useTrackingProxy<Type extends LdoBase, ReturnType>(
  shapeType: MaybeRefOrGetter<ShapeType<Type>>,
  createLdo: MaybeRefOrGetter<
    ((builder: LdoBuilder<Type>) => ReturnType) | undefined
  >,
  dataset: MaybeRefOrGetter<LdoDataset>,
): Ref<ReturnType | undefined>;
export function useTrackingProxy<Type extends LdoBase, ReturnType>(
  shapeType: MaybeRefOrGetter<ShapeType<Type>>,
  createLdo: MaybeRefOrGetter<
    ((builder: LdoBuilder<Type>) => ReturnType) | undefined
  >,
  dataset: MaybeRefOrGetter<LdoDataset>,
): Ref<ReturnType | undefined> {
  const linkedDataObject = shallowRef<ReturnType>() as Ref<
    ReturnType | undefined
  >;

  const forceUpdate = () => {
    triggerRef(linkedDataObject);
    console.log("TRIGGERING REF");
  };

  watch(
    [
      () => toValue(shapeType),
      () => toValue(createLdo),
      () => toValue(dataset),
    ],
    ([currentShapeType, currentCreateLdo, currentDataset], _, onCleanup) => {
      onCleanup(() => {
        currentDataset.removeListenerFromAllEvents(forceUpdate);
      });

      const builder = createTrackingProxyBuilder(
        currentDataset,
        currentShapeType,
        forceUpdate,
      );
      linkedDataObject.value = currentCreateLdo?.(builder);
    },
    { immediate: true },
  );

  return linkedDataObject;
}
