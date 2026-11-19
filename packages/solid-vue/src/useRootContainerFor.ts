import {
  isSolidUri,
  type SolidConnectedPlugin,
  type SolidContainerUri,
  type SolidLeafUri,
  type SolidContainer,
} from "@ldo/connected-solid";
import type {
  UseDatasetComposable,
  UseResourceComposable,
  UseResourceOptions,
} from "@ldo/vue";
import { ref, toValue, watch, type MaybeRefOrGetter, type Ref } from "vue";
import type { useSolidAuth } from "./useSolidAuth";

export interface UseRootContainerFor {
  (
    uri?: MaybeRefOrGetter<SolidContainerUri | SolidLeafUri | undefined>,
    options?: MaybeRefOrGetter<UseResourceOptions<"solid">>,
  ): Ref<SolidContainer | undefined>;
}

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
  useDataset: UseDatasetComposable<SolidConnectedPlugin[]>;
  useResource: UseResourceComposable<SolidConnectedPlugin[]>;
  useSolidAuth: typeof useSolidAuth;
}): UseRootContainerFor {
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
      async ([newUri, newIsActive], [oldUri]) => {
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
