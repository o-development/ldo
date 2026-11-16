import type {
  ConnectedPlugin,
  GetResourceReturnType,
  IConnectedLdoDataset,
  Resource,
} from "@ldo/connected";
import {
  shallowRef,
  watch,
  onBeforeUnmount,
  type Ref,
  triggerRef,
  type MaybeRefOrGetter,
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
    uri: MaybeRefOrGetter<UriType>,
    options?: MaybeRefOrGetter<UseResourceOptions<Name>>,
  ): Ref<GetResourceReturnType<Plugin, UriType>>;
  <
    Name extends Plugins[number]["name"],
    Plugin extends Extract<Plugins[number], { name: Name }>,
    UriType extends string,
  >(
    uri?: MaybeRefOrGetter<UriType | undefined>,
    options?: MaybeRefOrGetter<UseResourceOptions<Name>>,
  ): Ref<GetResourceReturnType<Plugin, UriType> | undefined>;
};

/**
 * @internal
 *
 * Creates a useResource composable.
 */
export function createUseResource<Plugins extends ConnectedPlugin[]>(
  dataset: IConnectedLdoDataset<Plugins>,
): useResourceType<Plugins> {
  /**
   * Returns a reactive resource and triggers a rerender if that resource is updated.
   */
  return function useResource<
    Name extends Plugins[number]["name"],
    Plugin extends Extract<Plugins[number], { name: Name }>,
    UriType extends string,
  >(
    uri?: MaybeRefOrGetter<UriType>,
    options?: MaybeRefOrGetter<UseResourceOptions<Name>>,
  ): Ref<GetResourceReturnType<Plugin, UriType> | undefined> {
    const resourceRef: Ref<Resource | undefined> = shallowRef<
      Resource | undefined
    >();
    let subscriptionId: string | undefined;

    const onResourceUpdate = () => {
      triggerRef(resourceRef);
    };

    watch(
      [() => toValue(uri), () => toValue(options)],
      async ([newUri, newOptions], [oldUri, oldOptions], onCleanup) => {
        // if (newUri === oldUri && newOptions === oldOptions) return;
        // TODO handle change in uri vs options more carefully

        let cancelled = false;
        let localResource: Resource | undefined;

        onCleanup(async () => {
          cancelled = true;
          localResource?.off("update", onResourceUpdate);
        });

        const uriChanged = oldUri !== newUri;
        const subscriptionTurnedOff = !newOptions?.subscribe;

        if (uriChanged || subscriptionTurnedOff) {
          if (subscriptionId) {
            const sid = subscriptionId;
            await resourceRef.value?.unsubscribeFromNotifications(sid);
            // clear old subscription id
            // but make sure we don't unintentionally clear a new subscription id
            if (sid === subscriptionId) subscriptionId = undefined;
            onResourceUpdate();
          }
        }

        if (newUri) {
          localResource = dataset.getResource(newUri) as Resource;
          resourceRef.value = localResource;
          if (!newOptions?.suppressInitialRead) {
            if (newOptions?.reloadOnMount) {
              resourceRef.value!.read();
            } else {
              resourceRef.value!.readIfUnfetched();
            }
          }

          if (resourceRef.value) {
            resourceRef.value.on("update", onResourceUpdate);
            // Subscribe to notifications if it's needed
            if (
              newOptions?.subscribe &&
              (uriChanged || !oldOptions?.subscribe)
            ) {
              const id = await resourceRef.value.subscribeToNotifications();
              onResourceUpdate();

              if (cancelled) {
                await resourceRef.value.unsubscribeFromNotifications(id);
                onResourceUpdate();
              } else {
                subscriptionId = id;
              }
            }
          }
        } else {
          resourceRef.value = undefined;
        }
      },
      { immediate: true },
    );

    // cleanup
    onBeforeUnmount(() => {
      resourceRef.value?.off("update", onResourceUpdate);
      if (subscriptionId) {
        resourceRef.value?.unsubscribeFromNotifications(subscriptionId);
        subscriptionId = undefined;
      }
    });

    return resourceRef as Ref<
      GetResourceReturnType<Plugin, UriType> | undefined,
      GetResourceReturnType<Plugin, UriType>
    >;
  };
}
