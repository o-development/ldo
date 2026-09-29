import type { ConnectedLdoDataset, ConnectedPlugin } from "@ldo/connected";
import { onBeforeUnmount, toValue, watch, type MaybeRefOrGetter } from "vue";

/**
 * @internal
 *
 * Creates a useSubscribeToResource composable
 */
export function createUseSubscribeToResource<Plugins extends ConnectedPlugin[]>(
  dataset: ConnectedLdoDataset<Plugins>,
) {
  /**
   * Starts and updates subscriptions to a list of resources
   */
  return function useSubscribeToResource(
    uris: MaybeRefOrGetter<string[]>,
  ): void {
    const currentlySubscribed: Record<string, string> = {};

    watch(
      () => toValue(uris),
      async (newUris) => {
        const resources = newUris.map((uri) => dataset.getResource(uri));
        const previousSubscriptions = { ...currentlySubscribed };

        await Promise.all(
          resources.map(async (resource) => {
            if (!previousSubscriptions[resource.uri]) {
              // Prevent multiple triggers from created subscriptions while waiting
              // for connection
              currentlySubscribed[resource.uri] = "AWAITING";
              const _result = await resource.readIfUnfetched();
              currentlySubscribed[resource.uri] =
                await resource.subscribeToNotifications();
            } else {
              delete previousSubscriptions[resource.uri];
            }
          }),
        );

        await Promise.all(
          Object.entries(previousSubscriptions).map(
            async ([resourceUri, subscriptionId]) => {
              // Unsubscribe
              delete currentlySubscribed[resourceUri];
              const resource = dataset.getResource(resourceUri);
              await resource.unsubscribeFromNotifications(subscriptionId);
            },
          ),
        );
      },
      { deep: true, immediate: true }, // also detect edits of the array in-place
    );

    onBeforeUnmount(async () => {
      await Promise.all(
        Object.entries(currentlySubscribed).map(
          async ([resourceUri, subscriptionId]) => {
            const resource = dataset.getResource(resourceUri);
            await resource.unsubscribeFromNotifications(subscriptionId);
          },
        ),
      );
    });
  };
}
