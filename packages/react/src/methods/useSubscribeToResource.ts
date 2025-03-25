import { useEffect, useRef } from "react";
import type { ConnectedLdoDataset, ConnectedPlugin } from "@ldo/connected";

export function createUseSubscribeToResource<Plugins extends ConnectedPlugin[]>(
  dataset: ConnectedLdoDataset<Plugins>,
) {
  return function useSubscribeToResource(...uris: string[]): void {
    const currentlySubscribed = useRef<Record<string, string>>({});
    useEffect(() => {
      const resources = uris.map((uri) => dataset.getResource(uri));
      const previousSubscriptions = { ...currentlySubscribed.current };
      Promise.all<void>(
        resources.map(async (resource) => {
          if (!previousSubscriptions[resource.uri]) {
            // Prevent multiple triggers from created subscriptions while waiting
            // for connection
            currentlySubscribed.current[resource.uri] = "AWAITING";
            // Read and subscribe
            await resource.readIfUnfetched();
            currentlySubscribed.current[resource.uri] =
              await resource.subscribeToNotifications();
          } else {
            delete previousSubscriptions[resource.uri];
          }
        }),
      ).then(async () => {
        // Unsubscribe from all remaining previous subscriptions
        await Promise.all(
          Object.entries(previousSubscriptions).map(
            async ([resourceUri, subscriptionId]) => {
              // Unsubscribe
              delete currentlySubscribed.current[resourceUri];
              const resource = dataset.getResource(resourceUri);
              await resource.unsubscribeFromNotifications(subscriptionId);
            },
          ),
        );
      });
    }, [uris]);

    // Cleanup Subscriptions
    useEffect(() => {
      return () => {
        Promise.all(
          Object.entries(currentlySubscribed.current).map(
            async ([resourceUri, subscriptionId]) => {
              const resource = dataset.getResource(resourceUri);
              await resource.unsubscribeFromNotifications(subscriptionId);
            },
          ),
        );
      };
    }, []);
  };
}
