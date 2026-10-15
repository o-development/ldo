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

export function createUseRootContainerFor({
  useDataset,
  useResource,
  useSolidAuth: useSAuth,
}: {
  useDataset: ReturnType<typeof createUseDataset<[SolidConnectedPlugin]>>;
  useResource: ReturnType<typeof createUseResource<SolidConnectedPlugin[]>>;
  useSolidAuth: typeof useSolidAuth;
}) {
  return function useRootContainerFor(
    uri?: MaybeRefOrGetter<SolidContainerUri | SolidLeafUri | undefined>,
    options?: MaybeRefOrGetter<UseResourceOptions<"solid">>,
  ) {
    const dataset = useDataset();
    const rootContainerUriRef = ref<SolidContainerUri | undefined>();
    const solidAuth = useSAuth();

    watch(
      [() => toValue(uri), () => solidAuth.session.value.isActive],
      async ([newUri, newIsActive], [oldUri, oldIsActive]) => {
        void newIsActive;
        if (newUri !== oldUri) rootContainerUriRef.value = undefined;
        if (newUri && isSolidUri(newUri)) {
          const givenResource = dataset.getResource(newUri);
          const result = await givenResource.getRootContainer();
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
