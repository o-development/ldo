import {
  isSolidUri,
  type SolidConnectedPlugin,
  type SolidContainer,
  type SolidLeaf,
} from "@ldo/connected-solid";
import type { useResourceType } from "@ldo/vue";
import { toValue, watch } from "vue";
import type { useSolidAuth } from "./useSolidAuth";

type UseSolidAuth = typeof useSolidAuth;

/**
 * @internal
 *
 * Creates a Solid-authentication-aware useResource composable.
 * If the uri is Solid uri, we want to refetch the resource when session.isActive changes
 */
export function createUseResourceWithAuth({
  useResource,
  useSolidAuth,
}: {
  useResource: useResourceType<SolidConnectedPlugin>;
  useSolidAuth: UseSolidAuth;
}): useResourceType<SolidConnectedPlugin> {
  /**
   * Solid-authentication-aware useResource method.
   * It returns a reactive resource and it triggers a rerender.
   * It re-fetches the resource when auth session status (signin/signout) changes.
   */
  return function useResourceWithAuth(
    uri: Parameters<typeof useResource>[0],
    options?: Parameters<typeof useResource>[1],
  ) {
    const resourceRef = useResource(uri, options);
    const solidAuth = useSolidAuth();
    watch([() => solidAuth.session.value.isActive], async ([isActive]) => {
      void isActive;
      const uriValue = toValue(uri);
      const { suppressInitialRead } = toValue(options) ?? {};
      if (uriValue && isSolidUri(uriValue)) {
        const resource = resourceRef.value as SolidLeaf | SolidContainer;
        // if the read has not been initialized and initial read is suppressed, don't re-read
        if (
          !suppressInitialRead ||
          resource.status.type !== "unfetched" ||
          resource.isLoading()
        ) {
          await resourceRef.value!.read();
        }
      }
    });
    return resourceRef;
  };
}
