import type {
  ConnectedLdoDataset,
  ConnectedPlugin,
  GetResourceReturnType,
} from "@ldo/connected";
import {
  shallowRef,
  watch,
  onBeforeUnmount,
  type Ref,
  triggerRef,
  type MaybeRef,
  toValue,
} from "vue";

export interface UseResourceOptions<Name> {
  pluginName?: Name;
  suppressInitialRead?: boolean;
  reloadOnMount?: boolean;
  subscribe?: boolean;
}

export type useResourceType<Plugins extends ConnectedPlugin[]> = {
  <
    Name extends Plugins[number]["name"],
    Plugin extends Extract<Plugins[number], { name: Name }>,
    UriType extends string,
  >(
    uri: MaybeRef<UriType>,
    options?: UseResourceOptions<Name>,
  ): Ref<GetResourceReturnType<Plugin, UriType>>;
  <
    Name extends Plugins[number]["name"],
    Plugin extends Extract<Plugins[number], { name: Name }>,
    UriType extends string,
  >(
    uri?: MaybeRef<UriType>,
    options?: UseResourceOptions<Name>,
  ): Ref<GetResourceReturnType<Plugin, UriType> | undefined>;
};

/**
 * @internal
 *
 * Creates a useResource composable.
 */
export function createUseResource<Plugins extends ConnectedPlugin[]>(
  dataset: ConnectedLdoDataset<Plugins>,
): useResourceType<Plugins> {
  /**
   * Returns a resource and triggers a rerender if that resource is updated.
   */
  return function useResource<
    Name extends Plugins[number]["name"],
    Plugin extends Extract<Plugins[number], { name: Name }>,
    UriType extends string,
  >(
    uri?: MaybeRef<UriType>,
    options?: UseResourceOptions<Name>,
  ): Ref<GetResourceReturnType<Plugin, UriType> | undefined> {
    const resourceRef: Ref<GetResourceReturnType<Plugin, UriType> | undefined> =
      shallowRef<GetResourceReturnType<Plugin, UriType> | undefined>();

    let currentResource: GetResourceReturnType<Plugin, UriType> | undefined;

    const onResourceUpdate = () => {
      triggerRef(resourceRef);
    };

    watch(
      () => toValue(uri),
      (newUri) => {
        if (currentResource) {
          currentResource.off("update", onResourceUpdate);
          currentResource.unsubscribeFromNotifications();
        }
        if (newUri) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          currentResource = dataset.getResource(newUri) as any;
          if (!options?.suppressInitialRead) {
            if (options?.reloadOnMount) {
              currentResource!.read();
            } else {
              currentResource!.readIfUnfetched();
            }
          }

          if (currentResource) {
            currentResource.on("update", onResourceUpdate);
            // Subscribe to notifications if it's needed
            if (options?.subscribe) {
              currentResource.subscribeToNotifications();
            }
          }
        } else {
          currentResource = undefined;
        }

        resourceRef.value = currentResource;
      },
      { immediate: true },
    );

    // cleanup
    onBeforeUnmount(() => {
      currentResource?.off("update", onResourceUpdate);
      currentResource?.unsubscribeFromNotifications();
    });

    return resourceRef;
  };
}
