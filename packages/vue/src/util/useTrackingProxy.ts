import type { LdoBuilder } from "@ldo/ldo";
import type { LdoBase, LdoDataset, ShapeType } from "@ldo/ldo";
import { createTrackingProxyBuilder } from "@ldo/connected";
import { onBeforeUnmount, type Ref, shallowRef, triggerRef } from "vue";

/**
 * @internal
 *
 * A composable for tracking proxies.
 *
 * TODO it doesn't update when createLdo, shapeType or dataset reference change
 */
export function useTrackingProxy<Type extends LdoBase, ReturnType>(
  shapeType: ShapeType<Type>,
  createLdo: (builder: LdoBuilder<Type>) => ReturnType,
  dataset: LdoDataset,
): Ref<ReturnType> {
  console.log("running useTrackingProxy");

  const linkedDataObject = shallowRef<ReturnType>() as Ref<ReturnType>;

  const forceUpdate = () => {
    triggerRef(linkedDataObject);
  };

  const builder = createTrackingProxyBuilder(dataset, shapeType, forceUpdate);
  linkedDataObject.value = createLdo(builder);

  // cleanup
  onBeforeUnmount(() => {
    dataset.removeListenerFromAllEvents(forceUpdate);
  });

  return linkedDataObject;
}
