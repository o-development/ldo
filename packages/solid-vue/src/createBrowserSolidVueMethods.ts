import { createLdoVueComposables, type useResourceType } from "@ldo/vue";
import { provideSolidAuth, useSolidAuth } from "./useSolidAuth.js";
import {
  isSolidUri,
  type SolidConnectedPlugin,
  solidConnectedPlugin,
  type SolidContainer,
  type SolidContainerUri,
  type SolidLeaf,
  type SolidLeafUri,
  type SolidResource,
} from "@ldo/connected-solid";
import type { ConnectedPlugin } from "@ldo/connected";
import { type MaybeRefOrGetter, toValue, triggerRef, watch } from "vue";
import { nextGraphConnectedPlugin } from "@ldo/connected-nextgraph";

export function createBrowserSolidVueComposables<
  Plugin extends ConnectedPlugin = never,
>(additionalPlugins: Plugin[] = []) {
  const { provideDataset, useResource, ...vueComposables } =
    createLdoVueComposables([solidConnectedPlugin, ...additionalPlugins]);
  /**
   * If the uri is Solid uri, we want refetch the resource when session.isActive changes
   */
  const useResourceWithAuth: typeof useResource = (
    uri: Parameters<typeof useResource>[0],
    options: Parameters<typeof useResource>[1],
  ) => {
    const resourceRef = useResource(uri, options);
    const solidAuth = useSolidAuth();
    watch([() => solidAuth.session.value.isActive], async ([isActive]) => {
      const uriValue = toValue(uri);
      const { suppressInitialRead } = toValue(options) ?? {};
      if (uriValue && isSolidUri(uriValue)) {
        const resource = resourceRef.value as SolidLeaf | SolidContainer;
        // if the read has not been initialized and initial read is suppressed, don't re-read
        if (
          !(
            suppressInitialRead &&
            resource.status.type === "unfetched" &&
            !resource.isLoading()
          )
        ) {
          console.log("REFETCHING");
          await resourceRef.value!.read();
        }
      }
    });
    return resourceRef;
  };
  function provideSolidLdo() {
    const dataset = provideDataset();
    const solidAuth = provideSolidAuth();
    dataset.setContext("solid", { fetch: solidAuth.fetch });
    return { dataset, solidAuth };
  }
  return {
    provideSolidLdo,
    provideDataset,
    useResource: useResourceWithAuth,
    ...vueComposables,
    provideSolidAuth,
    useSolidAuth,
  };
}

createBrowserSolidVueComposables([
  solidConnectedPlugin,
  nextGraphConnectedPlugin,
]);
