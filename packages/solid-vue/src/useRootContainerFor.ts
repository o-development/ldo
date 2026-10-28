import {
  isSolidUri,
  type SolidConnectedPlugin,
  type SolidContainerUri,
  type SolidLeafUri,
} from "@ldo/connected-solid";
import type {
  createUseDataset,
  createUseResource,
  UseResourceOptions,
} from "@ldo/vue";
import { ref, toValue, watch, type MaybeRefOrGetter } from "vue";
import type { useSolidAuth } from "./useSolidAuth";

/**
 * @internal
 *
 * Creates a useRootContainerFor composable
 */
export function createUseRootContainerFor({
  useDataset,
  useResource,
  useSolidAuth: useSAuth,
}: {
  useDataset: ReturnType<typeof createUseDataset<SolidConnectedPlugin>>;
  useResource: ReturnType<typeof createUseResource<SolidConnectedPlugin>>;
  useSolidAuth: typeof useSolidAuth;
}) {
  /**
   * Returns a reactive Solid Pod root container of a given URI
   * or undefined if the root container of the resource is not found.
   */
  return function useRootContainerFor(
    uri?: MaybeRefOrGetter<SolidContainerUri | SolidLeafUri | undefined>,
    options?: MaybeRefOrGetter<UseResourceOptions<"solid">>,
  ) {
    const dataset = useDataset();
    const rootContainerUriRef = ref<SolidContainerUri | undefined>();
    const solidAuth = useSAuth();

    watch(
      [() => toValue(uri), () => solidAuth.session.value.isActive],
      async ([newUri, newIsActive], [oldUri, _oldIsActive]) => {
        void newIsActive;
        if (newUri !== oldUri) rootContainerUriRef.value = undefined;
        if (newUri && isSolidUri(newUri)) {
          const givenResource = dataset.getResource(newUri);
          const result = await givenResource.getRootContainer();
          // now, proceed only if the newUri is still active, to prevent race condition
          if (newUri !== toValue(uri)) return;
          rootContainerUriRef.value = result.isError ? undefined : result.uri;
        } else {
          rootContainerUriRef.value = undefined;
        }
      },
      { immediate: true },
    );

    return useResource(rootContainerUriRef, options);
  };
}
